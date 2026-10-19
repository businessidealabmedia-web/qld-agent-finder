-- =====================================================================
-- QLD Agent Finder — Supabase database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a new project.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- ADMINS (who can use the admin portal) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- AGENTS (applications + approved profiles) ----------
create table if not exists public.agents (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete set null,
  status      text not null default 'pending' check (status in ('pending','approved','hidden','rejected')),
  verified    boolean not null default false,
  featured    boolean not null default false,
  -- contact (private: never shown on the public site)
  email       text not null,
  phone       text,
  licence     text,
  role        text,
  website     text,
  -- public profile
  name        text not null,
  agency      text,
  region      text,
  suburbs     text[] not null default '{}',
  specialty   text,
  bio         text,
  photo_url   text,
  commission  text,
  years       int  not null default 0,
  sold_12m    int  not null default 0,
  avg_days    int  not null default 30,
  rating      numeric(2,1) not null default 0,
  reviews     int  not null default 0,
  admin_notes text
);
create index if not exists agents_status_idx on public.agents(status);
create index if not exists agents_region_idx on public.agents(region);
create unique index if not exists agents_email_uq on public.agents(lower(email));

-- ---------- LEADS (sellers listing their home / appraisal requests) ----------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  source            text,             -- which form
  goal              text,
  address           text,
  suburb            text,
  postcode          text,
  property_type     text,
  bedrooms          text,
  bathrooms         text,
  car_spaces        text,
  timeframe         text,
  price_expectation text,
  name              text not null,
  phone             text,
  email             text,
  notes             text,
  agent             text,             -- agent the seller asked for (free text)
  consent           boolean not null default false,
  status            text not null default 'new' check (status in ('new','contacted','assigned','appraisal_booked','listed','sold','lost','spam')),
  assigned_agent    uuid references public.agents(id) on delete set null,
  admin_notes       text,
  agent_notes       text
);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_assigned_idx on public.leads(assigned_agent);

-- ---------- CONTACT MESSAGES ----------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  type       text,
  message    text not null,
  status     text not null default 'new' check (status in ('new','done'))
);

-- =====================================================================
-- PROTECTION TRIGGERS — stop the public / agents changing what they shouldn't
-- =====================================================================
create or replace function public.agents_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    new.updated_at := now();
    return new;
  end if;
  if tg_op = 'INSERT' then           -- public application form
    new.status := 'pending'; new.verified := false; new.featured := false;
    new.rating := 0; new.reviews := 0; new.user_id := null; new.admin_notes := null;
  else                               -- agent editing own profile
    new.id := old.id; new.status := old.status; new.verified := old.verified; new.featured := old.featured;
    new.rating := old.rating; new.reviews := old.reviews;
    -- allow linking only: an unlinked profile claimed by the logged-in owner of that email
    if not (old.user_id is null and new.user_id = auth.uid() and lower(old.email) = lower(auth.jwt() ->> 'email')) then
      new.user_id := old.user_id;
    end if;
    new.email := old.email; new.licence := old.licence; new.admin_notes := old.admin_notes;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists agents_guard on public.agents;
create trigger agents_guard before insert or update on public.agents
for each row execute function public.agents_guard();

create or replace function public.leads_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then           -- public form
    new.status := 'new'; new.assigned_agent := null; new.admin_notes := null; new.agent_notes := null;
    return new;
  end if;
  -- an assigned agent may only change status + their own notes
  new.status := case when new.status in ('contacted','appraisal_booked','listed','sold','lost') then new.status else old.status end;
  new.id := old.id; new.created_at := old.created_at; new.source := old.source; new.goal := old.goal;
  new.address := old.address; new.suburb := old.suburb; new.postcode := old.postcode;
  new.property_type := old.property_type; new.bedrooms := old.bedrooms; new.bathrooms := old.bathrooms;
  new.car_spaces := old.car_spaces; new.timeframe := old.timeframe; new.price_expectation := old.price_expectation;
  new.name := old.name; new.phone := old.phone; new.email := old.email; new.notes := old.notes;
  new.agent := old.agent; new.consent := old.consent; new.assigned_agent := old.assigned_agent;
  new.admin_notes := old.admin_notes;
  return new;
end $$;
drop trigger if exists leads_guard on public.leads;
create trigger leads_guard before insert or update on public.leads
for each row execute function public.leads_guard();

create or replace function public.contacts_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then new.status := 'new'; end if;
  return new;
end $$;
drop trigger if exists contacts_guard on public.contacts;
create trigger contacts_guard before insert on public.contacts
for each row execute function public.contacts_guard();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.admins   enable row level security;
alter table public.agents   enable row level security;
alter table public.leads    enable row level security;
alter table public.contacts enable row level security;

drop policy if exists "admins see self" on public.admins;
create policy "admins see self" on public.admins for select to authenticated using (user_id = auth.uid());

-- agents
drop policy if exists "anyone can apply"        on public.agents;
drop policy if exists "admin or owner can read" on public.agents;
drop policy if exists "admin or owner can edit" on public.agents;
drop policy if exists "admin can delete"        on public.agents;
create policy "anyone can apply"        on public.agents for insert to anon, authenticated with check (true);
create policy "admin or owner can read" on public.agents for select to authenticated using (public.is_admin() or user_id = auth.uid());
create policy "admin or owner can edit" on public.agents for update to authenticated using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid());
create policy "admin can delete"        on public.agents for delete to authenticated using (public.is_admin());

-- leads
drop policy if exists "anyone can submit"        on public.leads;
drop policy if exists "admin or assigned read"   on public.leads;
drop policy if exists "admin or assigned update" on public.leads;
drop policy if exists "admin delete leads"       on public.leads;
create policy "anyone can submit" on public.leads for insert to anon, authenticated with check (true);
create policy "admin or assigned read" on public.leads for select to authenticated
  using (public.is_admin() or assigned_agent in (select id from public.agents where user_id = auth.uid()));
create policy "admin or assigned update" on public.leads for update to authenticated
  using (public.is_admin() or assigned_agent in (select id from public.agents where user_id = auth.uid()))
  with check (public.is_admin() or assigned_agent in (select id from public.agents where user_id = auth.uid()));
create policy "admin delete leads" on public.leads for delete to authenticated using (public.is_admin());

-- contacts
drop policy if exists "anyone can message" on public.contacts;
drop policy if exists "admin manage contacts" on public.contacts;
create policy "anyone can message" on public.contacts for insert to anon, authenticated with check (true);
create policy "admin manage contacts" on public.contacts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- PUBLIC VIEW — only approved agents, only public fields
-- =====================================================================
create or replace view public.public_agents as
  select id, name, agency, region, suburbs, specialty, bio, photo_url, commission,
         years, sold_12m, avg_days, rating, reviews, verified, featured
  from public.agents
  where status = 'approved';
grant select on public.public_agents to anon, authenticated;

-- =====================================================================
-- AGENT LOGIN: link a logged-in agent to their application by email
-- =====================================================================
create or replace function public.claim_agent_profile()
returns uuid language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  select id into aid from public.agents where user_id = auth.uid() limit 1;
  if aid is not null then return aid; end if;
  update public.agents set user_id = auth.uid()
    where lower(email) = lower(auth.jwt() ->> 'email') and user_id is null and status <> 'rejected'
    returning id into aid;
  return aid;
end $$;
grant execute on function public.claim_agent_profile() to authenticated;

-- dashboard numbers for the admin portal
create or replace function public.admin_stats()
returns json language sql stable security definer set search_path = public as $$
  select case when public.is_admin() then json_build_object(
    'pending_agents',  (select count(*) from agents where status='pending'),
    'approved_agents', (select count(*) from agents where status='approved'),
    'new_leads',       (select count(*) from leads where status='new'),
    'total_leads',     (select count(*) from leads),
    'new_messages',    (select count(*) from contacts where status='new')
  ) else null end;
$$;
grant execute on function public.admin_stats() to authenticated;

-- =====================================================================
-- STORAGE — agent profile photos (public to view, agents upload their own)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('agent-photos','agent-photos', true)
on conflict (id) do nothing;

drop policy if exists "agent photos public read" on storage.objects;
drop policy if exists "agents upload own photo"  on storage.objects;
drop policy if exists "agents update own photo"  on storage.objects;
drop policy if exists "admin manage photos"      on storage.objects;
create policy "agent photos public read" on storage.objects for select using (bucket_id = 'agent-photos');
create policy "agents upload own photo" on storage.objects for insert to authenticated
  with check (bucket_id = 'agent-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "agents update own photo" on storage.objects for update to authenticated
  using (bucket_id = 'agent-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin manage photos" on storage.objects for all to authenticated
  using (bucket_id = 'agent-photos' and public.is_admin()) with check (bucket_id = 'agent-photos' and public.is_admin());

-- =====================================================================
-- LAST STEP (do this after you create your own login):
-- Supabase → Authentication → Users → Add user (your email + password)
-- then run:   insert into public.admins (user_id)
--             select id from auth.users where email = 'contact@qldagentfinder.com.au';
-- =====================================================================
