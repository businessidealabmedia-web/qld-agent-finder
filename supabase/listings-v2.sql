-- QAF listings v2: featured homes, view counts, enquiry follow-up. Free-tier safe. Run once.
alter table public.listings add column if not exists featured boolean not null default false;

create table if not exists public.listing_views (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  views int not null default 0,
  last_view timestamptz
);
alter table public.listing_views enable row level security;
drop policy if exists "views owner or admin read" on public.listing_views;
create policy "views owner or admin read" on public.listing_views for select to authenticated
  using (public.is_admin() or listing_id in (select l.id from public.listings l join public.agents a on a.id=l.agent_id where a.user_id=auth.uid()));

create or replace function public.bump_listing_view(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.listings where id = p_id and status = 'live') then return; end if;
  insert into public.listing_views(listing_id, views, last_view) values (p_id, 1, now())
  on conflict (listing_id) do update set views = public.listing_views.views + 1, last_view = now();
end $$;
grant execute on function public.bump_listing_view(uuid) to anon, authenticated;

alter table public.listing_enquiries add column if not exists agent_notes text check (char_length(agent_notes) <= 1000);
alter table public.listing_enquiries drop constraint if exists listing_enquiries_status_check;
alter table public.listing_enquiries add constraint listing_enquiries_status_check check (status in ('new','contacted','done'));

-- agents can never change featured themselves
create or replace function public.listings_guard_featured()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then new.featured := false; else new.featured := old.featured; end if;
  return new;
end $$;
drop trigger if exists a_listings_guard_featured on public.listings;
create trigger a_listings_guard_featured before insert or update on public.listings for each row execute function public.listings_guard_featured();

create or replace view public.public_listings as
  select l.id, l.title, l.description,
         case when l.hide_address then null else l.address_line end as address_line,
         l.suburb, l.postcode, l.region, l.price_display, l.price_num, l.property_type,
         l.beds, l.baths, l.cars, l.land_m2, l.features, l.photos, l.open_homes, l.auction_at,
         l.status, l.published_at, l.sold_at, l.agent_id,
         a.name as agent_name, a.agency as agent_agency, a.photo_url as agent_photo, a.verified as agent_verified,
         l.featured
  from public.listings l
  join public.agents a on a.id = l.agent_id and a.status = 'approved'
  where l.status = 'live' or (l.status = 'sold' and l.sold_at > now() - interval '60 days');
grant select on public.public_listings to anon, authenticated;
