-- Server-side staff passcode (APPLIED to the live database).
--
-- The passcode is NOT in the app bundle or the repo. Its bcrypt hash lives in
-- public.app_config (which the anon/public key cannot read), and the client
-- calls the verify_staff_passcode() RPC, which returns only a boolean.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_config (
  key text primary key,
  value text not null
);
alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;

create or replace function public.verify_staff_passcode(p text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_config
    where key = 'staff_passcode_hash'
      and value = extensions.crypt(p, value)
  );
$$;

revoke execute on function public.verify_staff_passcode(text) from public;
grant execute on function public.verify_staff_passcode(text) to anon, authenticated;

-- SET / ROTATE the staff passcode — replace '7842' with a new code and re-run.
-- (7842 is in this repo's git history, so rotate it before any public launch.)
insert into public.app_config (key, value)
values ('staff_passcode_hash', extensions.crypt('7842', extensions.gen_salt('bf')))
on conflict (key) do update set value = excluded.value;
