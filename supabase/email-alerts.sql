-- =====================================================================
-- QLD Agent Finder — EMAIL ALERTS (new lead / agent application / contact message)
-- Run ONCE in Supabase → SQL Editor → New query → Run.
--
-- BEFORE YOU RUN: replace the two things marked  <<< CHANGE ME >>>
--   1. your Resend API key   (Resend → API Keys → Create → "Sending access")
--   2. the alert email address (where YOU want the alerts)
-- Do NOT commit your real key to GitHub — edit it only in the Supabase editor.
-- =====================================================================

create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- 1) store the Resend key safely (Vault, encrypted) -------------------
select vault.create_secret(
  're_PASTE_YOUR_RESEND_API_KEY_HERE',      -- <<< CHANGE ME >>>
  'resend_api_key',
  'Resend key for QAF email alerts'
)
where not exists (select 1 from vault.secrets where name = 'resend_api_key');

-- 2) settings (who gets alerts, who they come from) -------------------
create table if not exists public.alert_settings (
  id         int primary key default 1 check (id = 1),
  alert_to   text not null,
  alert_from text not null default 'QLD Agent Finder <noreply@qldagentfinder.com.au>'
);
alter table public.alert_settings enable row level security;   -- no policies = private

insert into public.alert_settings (id, alert_to)
values (1, 'contact@qldagentfinder.com.au')                     -- <<< CHANGE ME >>>
on conflict (id) do update set alert_to = excluded.alert_to;

-- 3) helpers ----------------------------------------------------------
create or replace function public.qaf_esc(t text)
returns text language sql immutable as $$
  select replace(replace(replace(coalesce(t,'—'),'&','&amp;'),'<','&lt;'),'>','&gt;');
$$;

create or replace function public.qaf_send_alert(subject text, html text, reply_to text default null)
returns void language plpgsql security definer set search_path = public, extensions, vault as $$
declare k text; s record;
begin
  select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select * into s from public.alert_settings where id = 1;
  if k is null or s.alert_to is null then return; end if;
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization','Bearer '||k,'Content-Type','application/json'),
    body    := jsonb_strip_nulls(jsonb_build_object(
                 'from', s.alert_from, 'to', jsonb_build_array(s.alert_to),
                 'subject', subject, 'html', html,
                 'reply_to', reply_to))
  );
exception when others then
  null;   -- an email problem must NEVER block a form from saving
end $$;

-- 4) triggers ---------------------------------------------------------
create or replace function public.alert_new_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.qaf_send_alert(
    '🏠 New lead: ' || new.name || coalesce(' – ' || nullif(new.suburb,''), ''),
    '<h2>New seller lead</h2>'
    || '<p><b>' || qaf_esc(new.name) || '</b><br>📞 ' || qaf_esc(new.phone) || '<br>✉️ ' || qaf_esc(new.email) || '</p>'
    || '<p><b>Address:</b> ' || qaf_esc(new.address) || ', ' || qaf_esc(new.suburb) || ' ' || qaf_esc(new.postcode) || '<br>'
    || '<b>Goal:</b> ' || qaf_esc(new.goal) || '<br><b>Timeframe:</b> ' || qaf_esc(new.timeframe) || '<br>'
    || '<b>Type:</b> ' || qaf_esc(new.property_type) || ' · ' || qaf_esc(new.bedrooms) || ' bed / ' || qaf_esc(new.bathrooms) || ' bath / ' || qaf_esc(new.car_spaces) || ' car<br>'
    || '<b>Price expectation:</b> ' || qaf_esc(new.price_expectation) || '<br><b>Requested agent:</b> ' || qaf_esc(new.agent) || '<br>'
    || '<b>Notes:</b> ' || qaf_esc(new.notes) || '<br><b>Form:</b> ' || qaf_esc(new.source) || '</p>'
    || '<p><a href="https://admin.qldagentfinder.com.au">Open admin → Leads</a></p>',
    nullif(new.email,'')
  );
  return new;
end $$;
drop trigger if exists alert_new_lead on public.leads;
create trigger alert_new_lead after insert on public.leads
for each row execute function public.alert_new_lead();

create or replace function public.alert_new_agent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.qaf_send_alert(
    '🧑‍💼 New agent application: ' || new.name,
    '<h2>New agent application</h2>'
    || '<p><b>' || qaf_esc(new.name) || '</b> · ' || qaf_esc(new.agency) || '<br>'
    || '📞 ' || qaf_esc(new.phone) || '<br>✉️ ' || qaf_esc(new.email) || '<br>'
    || '<b>Licence:</b> ' || qaf_esc(new.licence) || '<br><b>Region:</b> ' || qaf_esc(new.region) || '<br>'
    || '<b>Website:</b> ' || qaf_esc(new.website) || '</p>'
    || '<p>Check the licence on the QLD register, then approve.</p>'
    || '<p><a href="https://admin.qldagentfinder.com.au">Open admin → Applications</a></p>',
    nullif(new.email,'')
  );
  return new;
end $$;
drop trigger if exists alert_new_agent on public.agents;
create trigger alert_new_agent after insert on public.agents
for each row when (new.status = 'pending') execute function public.alert_new_agent();

create or replace function public.alert_new_contact()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.qaf_send_alert(
    '💬 New message: ' || new.name,
    '<h2>New contact message</h2>'
    || '<p><b>' || qaf_esc(new.name) || '</b> · ' || qaf_esc(new.email) || '<br><b>Type:</b> ' || qaf_esc(new.type) || '</p>'
    || '<p>' || replace(qaf_esc(new.message), E'\n', '<br>') || '</p>'
    || '<p><a href="https://admin.qldagentfinder.com.au">Open admin → Messages</a></p>',
    nullif(new.email,'')
  );
  return new;
end $$;
drop trigger if exists alert_new_contact on public.contacts;
create trigger alert_new_contact after insert on public.contacts
for each row execute function public.alert_new_contact();

-- 5) TEST: sends one test email right now (check your inbox + spam)
-- select public.qaf_send_alert('✅ QAF alerts test', '<p>Email alerts are working.</p>');
