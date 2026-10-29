-- QAF v3: homeowners can post directly (no login), moderated by admin. Free-tier safe.
alter table public.listings alter column agent_id drop not null;
alter table public.listings add column if not exists seller_type text not null default 'agent' check (seller_type in ('agent','owner'));
alter table public.listings add column if not exists owner_name text check (char_length(owner_name) <= 80);
alter table public.listings add column if not exists owner_email text check (owner_email is null or owner_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');
alter table public.listings add column if not exists owner_phone text check (char_length(owner_phone) <= 30);
alter table public.listings add column if not exists owner_consent boolean not null default false;
alter table public.listings drop constraint if exists listings_owner_chk;
alter table public.listings add constraint listings_owner_chk check (agent_id is not null or (seller_type = 'owner' and owner_email is not null and owner_name is not null));

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
  txt := lower(coalesce(new.title,'')||' '||coalesce(new.description,'')||' '||coalesce(new.address_line,'')||' '||coalesce(new.open_homes,'')||' '||coalesce(array_to_string(new.features,' '),'')||' '||coalesce(new.owner_name,''));
  if txt ~ 'https?://|www\.|<script|\[url=' then raise exception 'Links are not allowed in listings' using errcode = 'P0001'; end if;

  -- HOMEOWNER (no login) insert path
  if tg_op = 'INSERT' and new.agent_id is null then
    if new.seller_type <> 'owner' or not new.owner_consent then raise exception 'Please tick the confirmation box' using errcode = 'P0001'; end if;
    if cardinality(new.photos) < 1 or cardinality(new.photos) > 8 then raise exception 'Add between 1 and 8 photos' using errcode = 'P0001'; end if;
    foreach p in array new.photos loop
      if p not like 'https://vfwrykwhmvqrdgyuijsa.supabase.co/storage/v1/object/public/listing-photos/owner/%' then raise exception 'Invalid photo' using errcode = 'P0001'; end if;
    end loop;
    select count(*) into n from public.listings where lower(owner_email) = lower(new.owner_email) and created_at > now() - interval '24 hours';
    if n >= 3 then raise exception 'Too many listings from this email today. Try again tomorrow.' using errcode = 'P0001'; end if;
    select count(*) into n from public.listings where seller_type = 'owner' and created_at > now() - interval '1 hour';
    if n >= 30 then raise exception 'Busy right now. Please try again later.' using errcode = 'P0001'; end if;
    new.status := 'pending'; new.featured := false; new.published_at := null; new.sold_at := null; new.admin_notes := null; new.hide_address := coalesce(new.hide_address,false);
    new.updated_at := now();
    return new;
  end if;

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
    new.published_at := null; new.sold_at := null; new.admin_notes := null; new.seller_type := 'agent'; new.owner_name := null; new.owner_email := null; new.owner_phone := null;
  else
    new.agent_id := old.agent_id; new.admin_notes := old.admin_notes; new.published_at := old.published_at; new.created_at := old.created_at;
    new.sold_at := old.sold_at; new.seller_type := old.seller_type; new.owner_name := old.owner_name; new.owner_email := old.owner_email; new.owner_phone := old.owner_phone; new.owner_consent := old.owner_consent;
    if new.status <> old.status then
      if not ((old.status in ('draft','rejected','withdrawn') and new.status in ('draft','pending'))
           or (old.status = 'pending' and new.status in ('draft','pending','withdrawn'))
           or (old.status = 'live' and new.status in ('sold','withdrawn'))
           or (old.status = 'sold' and new.status in ('withdrawn'))) then
        new.status := old.status;
      end if;
    end if;
    if new.status = 'sold' and old.status <> 'sold' then new.sold_at := now(); end if;
    if old.status = 'live' and new.status = 'live' and
       (to_jsonb(new) - 'status' - 'updated_at') <> (to_jsonb(old) - 'status' - 'updated_at') then
      new.status := 'pending';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop policy if exists "owners insert listing" on public.listings;
create policy "owners insert listing" on public.listings for insert to anon, authenticated
  with check (agent_id is null and seller_type = 'owner' and status = 'pending');

drop policy if exists "owners upload listing photo" on storage.objects;
create policy "owners upload listing photo" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'listing-photos' and name like 'owner/%');

create or replace view public.public_listings as
  select l.id, l.title, l.description,
         case when l.hide_address then null else l.address_line end as address_line,
         l.suburb, l.postcode, l.region, l.price_display, l.price_num, l.property_type,
         l.beds, l.baths, l.cars, l.land_m2, l.features, l.photos, l.open_homes, l.auction_at,
         l.status, l.published_at, l.sold_at, l.agent_id,
         case when l.agent_id is null then 'Private seller' else a.name end as agent_name,
         a.agency as agent_agency, a.photo_url as agent_photo, coalesce(a.verified,false) as agent_verified,
         l.featured, l.seller_type
  from public.listings l
  left join public.agents a on a.id = l.agent_id
  where (l.agent_id is null or a.status = 'approved')
    and (l.status = 'live' or (l.status = 'sold' and l.sold_at > now() - interval '60 days'));
grant select on public.public_listings to anon, authenticated;

create or replace function public.alert_new_enquiry()
returns trigger language plpgsql security definer set search_path = public as $$
declare l record; ag record; body text; dest text;
begin
  select * into l from public.listings where id = new.listing_id;
  select * into ag from public.agents where id = l.agent_id;
  dest := coalesce(ag.email, l.owner_email);
  body := '<h2>New enquiry on your listing</h2><p><b>' || qaf_esc(l.title) || '</b> (' || qaf_esc(l.suburb) || ')</p>'
    || '<p><b>' || qaf_esc(new.name) || '</b><br>✉️ ' || qaf_esc(new.email) || '<br>📞 ' || qaf_esc(new.phone) || '</p>'
    || '<p>' || replace(qaf_esc(new.message), E'\n', '<br>') || '</p>'
    || '<p>Reply to this email to answer the buyer directly.</p>';
  perform public.qaf_send_alert_to(dest, '🏠 New enquiry: ' || l.title, body, nullif(new.email,''));
  perform public.qaf_send_alert('🏠 Listing enquiry: ' || l.title, body, nullif(new.email,''));
  return new;
end $$;

-- tell the owner their listing was received / is live
create or replace function public.alert_owner_listing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.seller_type <> 'owner' or new.owner_email is null then return new; end if;
  if tg_op = 'INSERT' then
    perform public.qaf_send_alert_to(new.owner_email, 'We received your home listing', '<h2>Thanks, ' || qaf_esc(new.owner_name) || '</h2><p>We received <b>' || qaf_esc(new.title) || '</b>. We check every listing, usually within a day, then it goes live. We will email you again when it is live.</p><p>To change or remove it, reply to this email.</p>', 'contact@qldagentfinder.com.au');
  elsif new.status = 'live' and old.status is distinct from 'live' then
    perform public.qaf_send_alert_to(new.owner_email, 'Your home is now live', '<h2>Your home is live</h2><p><b>' || qaf_esc(new.title) || '</b> is now on QLD Agent Finder:<br><a href="https://qldagentfinder.com.au/property.html?id=' || new.id || '">View your listing</a></p><p>Buyer enquiries will be emailed straight to you. To change or remove the listing, reply to this email.</p>', 'contact@qldagentfinder.com.au');
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    perform public.qaf_send_alert_to(new.owner_email, 'About your home listing', '<p>We could not publish <b>' || qaf_esc(new.title) || '</b>.</p><p>' || qaf_esc(new.admin_notes) || '</p><p>Reply to this email and we will help you fix it.</p>', 'contact@qldagentfinder.com.au');
  end if;
  return new;
end $$;
drop trigger if exists alert_owner_listing_i on public.listings;
drop trigger if exists alert_owner_listing_u on public.listings;
create trigger alert_owner_listing_i after insert on public.listings for each row execute function public.alert_owner_listing();
create trigger alert_owner_listing_u after update of status on public.listings for each row execute function public.alert_owner_listing();
