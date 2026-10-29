-- QLD Agent Finder — spam protection (server-side, cannot be bypassed from the browser)
-- Applies only to the public (anon) and logged-in agents, never to admin.
create or replace function public.qaf_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare txt text; n int; em text;
begin
  if public.is_admin() or coalesce(auth.role(),'') not in ('anon','authenticated') then return new; end if;
  txt := lower(coalesce(to_jsonb(new)::text,''));
  -- links / scripts in submissions = spam (real sellers and agents don't paste URLs here)
  if tg_table_name <> 'agents' and (txt like '%http://%' or txt like '%https://%' or txt like '%<script%' or txt like '%[url=%') then
    raise exception 'Links are not allowed in this form' using errcode = 'P0001';
  end if;
  em := lower(coalesce(to_jsonb(new)->>'email',''));
  if tg_table_name = 'leads' then
    select count(*) into n from public.leads where created_at > now() - interval '1 hour' and (lower(coalesce(email,''))=em and em<>'' or phone is not distinct from new.phone and new.phone is not null);
    if n >= 3 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
    select count(*) into n from public.leads where created_at > now() - interval '1 hour';
    if n >= 60 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'contacts' then
    select count(*) into n from public.contacts where created_at > now() - interval '1 hour' and lower(email)=em;
    if n >= 3 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
    select count(*) into n from public.contacts where created_at > now() - interval '1 hour';
    if n >= 40 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'agents' and tg_op = 'INSERT' then
    select count(*) into n from public.agents where created_at > now() - interval '1 hour';
    if n >= 20 then raise exception 'Too many requests, please try again later' using errcode = 'P0001'; end if;
  end if;
  return new;
end $$;

drop trigger if exists a_rate_limit on public.leads;
create trigger a_rate_limit before insert on public.leads for each row execute function public.qaf_rate_limit();
drop trigger if exists a_rate_limit on public.contacts;
create trigger a_rate_limit before insert on public.contacts for each row execute function public.qaf_rate_limit();
drop trigger if exists a_rate_limit on public.agents;
create trigger a_rate_limit before insert on public.agents for each row execute function public.qaf_rate_limit();
