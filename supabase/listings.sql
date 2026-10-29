-- =====================================================================
-- QLD Agent Finder: PROPERTY LISTINGS (homes for sale) + buyer enquiries
-- Free tier friendly: small rows, photos resized in the browser before upload.
-- Agents create listings -> status 'pending' -> admin approves -> 'live'.
-- =====================================================================
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,
  sold_at       timestamptz,
  agent_id      uuid not null references public.agents(id) on delete cascade,
  status        text not null default 'draft' check (status in ('draft','pending','live','sold','withdrawn','rejected')),
  title         text not null check (char_length(title) between 5 and 120),
  description   text check (char_length(description) <= 4000),
  address_line  text check (char_length(address_line) <= 120),
  hide_address  boolean not null default false,
  suburb        text not null check (char_length(suburb) <= 60),
  postcode      text check (postcode ~ '^[0-9]{4}$'),
  region        text not null,
  price_display text not null check (char_length(price_display) <= 60),
  price_num     int check (price_num is null or price_num >= 0),
  property_type text not null,
  beds          int check (beds between 0 and 20),
  baths         int check (baths between 0 and 20),
  cars          int check (cars between 0 and 20),
  land_m2       int check (land_m2 is null or land_m2 >= 0),
  features      text[] not null default '{}' check (cardinality(features) <= 20),
  photos        text[] not null default '{}' check (cardinality(photos) <= 15),
  open_homes    text check (char_length(open_homes) <= 300),
  auction_at    timestamptz,
  admin_notes   text
);
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_agent_idx  on public.listings(agent_id);
create index if not exists listings_region_idx on public.listings(region);

create or replace function public.listings_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare ok boolean; n int; p text; txt text;
begin
  if public.is_admin() then
    new.updated_at := now();
    if new.status = 'live' and (tg_op = 'INSERT' or old.status <> 'live') then new.published_at := coalesce(new.published_at, now()); end if;
    if new.status = 'sold' and (tg_op = 'INSERT' or old.status <> 'sold') then new.sold_at := coalesce(new.sold_at, now()); end if;
    return new;
  end if;
  -- links / scripts are not allowed in listing text
  txt := lower(coalesce(new.title,'')||' '||coalesce(new.description,'')||' '||coalesce(new.address_line,'')||' '||coalesce(new.open_homes,'')||' '||coalesce(array_to_string(new.features,' '),''));
  if txt ~ 'https?://|www\.|<script|\[url=' then raise exception 'Links are not allowed in listings' using errcode = 'P0001'; end if;
  -- photos must come from our own storage bucket
  foreach p in array new.photos loop
    if p not like 'https://vfwrykwhmvqrdgyuijsa.supabase.co/storage/v1/object/public/listing-photos/%' then
      raise exception 'Invalid photo' using errcode = 'P0001';
    end if;
  end loop;
  if tg_op = 'INSERT' then
    select exists(select 1 from public.agents a where a.id = new.agent_id and a.user_id = auth.uid() and a.status = 'approved') into ok;
    if not ok then raise exception 'Only approved agents can list properties' using errcode = 'P0001'; end if;
    select count(*) into n from public.listings where agent_id = new.agent_id and status in ('draft','pending','live');
    if n >= 25 then raise exception 'Listing limit reached (25). Mark old listings sold or withdrawn.' using errcode = 'P0001'; end if;
    if new.status not in ('draft','pending') then new.status := 'draft'; end if;
    new.published_at := null; new.sold_at := null; new.admin_notes := null;
  else
    new.agent_id := old.agent_id; new.admin_notes := old.admin_notes; new.published_at := old.published_at; new.created_at := old.created_at;
    new.sold_at := old.sold_at;
    -- allowed status moves for agents (only admin can make a listing live)
    if new.status <> old.status then
      if not ((old.status in ('draft','rejected','withdrawn') and new.status in ('draft','pending'))
           or (old.status = 'pending' and new.status in ('draft','pending','withdrawn'))
           or (old.status = 'live' and new.status in ('sold','withdrawn'))
           or (old.status = 'sold' and new.status in ('withdrawn'))) then
        new.status := old.status;
      end if;
    end if;
    if new.status = 'sold' and old.status <> 'sold' then new.sold_at := now(); end if;
    -- editing a live listing sends it back for review
    if old.status = 'live' and new.status = 'live' and
       (to_jsonb(new) - 'status' - 'updated_at') <> (to_jsonb(old) - 'status' - 'updated_at') then
      new.status := 'pending';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists listings_guard on public.listings;
create trigger listings_guard before insert or update on public.listings for each row execute function public.listings_guard();

alter table public.listings enable row level security;
drop policy if exists "listings owner or admin read"   on public.listings;
drop policy if exists "listings owner insert"          on public.listings;
drop policy if exists "listings owner or admin update" on public.listings;
drop policy if exists "listings owner or admin delete" on public.listings;
create policy "listings owner or admin read" on public.listings for select to authenticated
  using (public.is_admin() or agent_id in (select id from public.agents where user_id = auth.uid()));
create policy "listings owner insert" on public.listings for insert to authenticated
  with check (public.is_admin() or agent_id in (select id from public.agents where user_id = auth.uid() and status = 'approved'));
create policy "listings owner or admin update" on public.listings for update to authenticated
  using (public.is_admin() or agent_id in (select id from public.agents where user_id = auth.uid()))
  with check (public.is_admin() or agent_id in (select id from public.agents where user_id = auth.uid()));
create policy "listings owner or admin delete" on public.listings for delete to authenticated
  using (public.is_admin() or (status in ('draft','rejected','withdrawn') and agent_id in (select id from public.agents where user_id = auth.uid())));

-- PUBLIC VIEW: live listings (and recently sold) from approved agents only
create or replace view public.public_listings as
  select l.id, l.title, l.description,
         case when l.hide_address then null else l.address_line end as address_line,
         l.suburb, l.postcode, l.region, l.price_display, l.price_num, l.property_type,
         l.beds, l.baths, l.cars, l.land_m2, l.features, l.photos, l.open_homes, l.auction_at,
         l.status, l.published_at, l.sold_at, l.agent_id,
         a.name as agent_name, a.agency as agent_agency, a.photo_url as agent_photo, a.verified as agent_verified
  from public.listings l
  join public.agents a on a.id = l.agent_id and a.status = 'approved'
  where l.status = 'live' or (l.status = 'sold' and l.sold_at > now() - interval '60 days');
grant select on public.public_listings to anon, authenticated;

-- BUYER ENQUIRIES
create table if not exists public.listing_enquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text check (char_length(phone) <= 30),
  message    text not null check (char_length(message) between 2 and 1500),
  consent    boolean not null default false,
  status     text not null default 'new' check (status in ('new','done'))
);
create index if not exists enq_listing_idx on public.listing_enquiries(listing_id);

create or replace function public.listing_enquiry_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int; txt text;
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'UPDATE' then new.listing_id := old.listing_id; new.name := old.name; new.email := old.email; new.phone := old.phone; new.message := old.message; new.consent := old.consent; new.created_at := old.created_at; return new; end if;
  if not exists (select 1 from public.public_listings pl where pl.id = new.listing_id and pl.status = 'live') then
    raise exception 'This property is no longer available' using errcode = 'P0001'; end if;
  if not new.consent then raise exception 'Please tick the consent box' using errcode = 'P0001'; end if;
  txt := lower(coalesce(new.message,'')||' '||coalesce(new.name,''));
  if txt ~ 'https?://|www\.|<script|\[url=' then raise exception 'Links are not allowed in this form' using errcode = 'P0001'; end if;
  select count(*) into n from public.listing_enquiries where created_at > now() - interval '1 hour' and lower(email) = lower(new.email);
  if n >= 3 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
  select count(*) into n from public.listing_enquiries where created_at > now() - interval '1 hour';
  if n >= 80 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
  new.status := 'new';
  return new;
end $$;
drop trigger if exists listing_enquiry_guard on public.listing_enquiries;
create trigger listing_enquiry_guard before insert or update on public.listing_enquiries for each row execute function public.listing_enquiry_guard();

alter table public.listing_enquiries enable row level security;
drop policy if exists "enq anyone insert"   on public.listing_enquiries;
drop policy if exists "enq owner read"      on public.listing_enquiries;
drop policy if exists "enq owner update"    on public.listing_enquiries;
drop policy if exists "enq admin delete"    on public.listing_enquiries;
create policy "enq anyone insert" on public.listing_enquiries for insert to anon, authenticated with check (true);
create policy "enq owner read" on public.listing_enquiries for select to authenticated
  using (public.is_admin() or listing_id in (select l.id from public.listings l join public.agents a on a.id = l.agent_id where a.user_id = auth.uid()));
create policy "enq owner update" on public.listing_enquiries for update to authenticated
  using (public.is_admin() or listing_id in (select l.id from public.listings l join public.agents a on a.id = l.agent_id where a.user_id = auth.uid()))
  with check (public.is_admin() or listing_id in (select l.id from public.listings l join public.agents a on a.id = l.agent_id where a.user_id = auth.uid()));
create policy "enq admin delete" on public.listing_enquiries for delete to authenticated using (public.is_admin());

-- EMAIL: tell the listing agent (reply-to = buyer) and the admin
create or replace function public.qaf_send_alert_to(to_email text, subject text, html text, reply_to text default null)
returns void language plpgsql security definer set search_path = public, extensions, vault as $$
declare k text; s record;
begin
  select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select * into s from public.alert_settings where id = 1;
  if k is null or to_email is null then return; end if;
  perform net.http_post(url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization','Bearer '||k,'Content-Type','application/json'),
    body := jsonb_strip_nulls(jsonb_build_object('from', s.alert_from, 'to', jsonb_build_array(to_email), 'subject', subject, 'html', html, 'reply_to', reply_to)));
exception when others then null;
end $$;

create or replace function public.alert_new_enquiry()
returns trigger language plpgsql security definer set search_path = public as $$
declare l record; ag record; body text;
begin
  select * into l from public.listings where id = new.listing_id;
  select * into ag from public.agents where id = l.agent_id;
  body := '<h2>New enquiry on your listing</h2><p><b>' || qaf_esc(l.title) || '</b> (' || qaf_esc(l.suburb) || ')</p>'
    || '<p><b>' || qaf_esc(new.name) || '</b><br>✉️ ' || qaf_esc(new.email) || '<br>📞 ' || qaf_esc(new.phone) || '</p>'
    || '<p>' || replace(qaf_esc(new.message), E'\n', '<br>') || '</p>'
    || '<p>Reply to this email to answer the buyer directly. You can also see enquiries in the <a href="https://agents.qldagentfinder.com.au">agent portal</a>.</p>';
  perform public.qaf_send_alert_to(ag.email, '🏠 New enquiry: ' || l.title, body, nullif(new.email,''));
  perform public.qaf_send_alert('🏠 Listing enquiry: ' || l.title, body, nullif(new.email,''));
  return new;
end $$;
drop trigger if exists alert_new_enquiry on public.listing_enquiries;
create trigger alert_new_enquiry after insert on public.listing_enquiries for each row execute function public.alert_new_enquiry();

create or replace function public.alert_listing_submitted()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.qaf_send_alert('📋 Listing to review: ' || new.title,
    '<h2>Listing submitted for review</h2><p><b>' || qaf_esc(new.title) || '</b><br>' || qaf_esc(new.suburb) || ' · ' || qaf_esc(new.price_display) || '</p><p><a href="https://admin.qldagentfinder.com.au">Open admin → Listings</a></p>');
  return new;
end $$;
drop trigger if exists alert_listing_submitted on public.listings;
drop trigger if exists alert_listing_submitted_u on public.listings;
create trigger alert_listing_submitted after insert on public.listings
for each row when (new.status = 'pending') execute function public.alert_listing_submitted();
create trigger alert_listing_submitted_u after update of status on public.listings
for each row when (new.status = 'pending' and old.status is distinct from 'pending') execute function public.alert_listing_submitted();

-- PHOTO STORAGE (public to view; agents upload into their own folder; 3 MB max, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos','listing-photos', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = 3145728, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "listing photos public read"  on storage.objects;
drop policy if exists "agents upload listing photo" on storage.objects;
drop policy if exists "agents delete listing photo" on storage.objects;
drop policy if exists "admin manage listing photos" on storage.objects;
create policy "listing photos public read" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "agents upload listing photo" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
              and exists (select 1 from public.agents a where a.user_id = auth.uid() and a.status = 'approved'));
create policy "agents delete listing photo" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin manage listing photos" on storage.objects for all to authenticated
  using (bucket_id = 'listing-photos' and public.is_admin()) with check (bucket_id = 'listing-photos' and public.is_admin());
