-- Email verification (APPLIED to the live database).
--
-- Students prove they own an email via a 6-digit code before borrowing. The
-- flow runs through the send-verification-code / verify-code Edge Functions
-- (service role). The anon/public key cannot read either table.

create table if not exists public.email_verifications (
  email text primary key,
  code_hash text not null,            -- sha256(code) hex
  expires_at timestamptz not null,
  attempts int not null default 0,
  last_sent_at timestamptz not null default now()
);
alter table public.email_verifications enable row level security;
revoke all on public.email_verifications from anon, authenticated;

create table if not exists public.verified_emails (
  email text primary key,
  verified_at timestamptz not null default now()
);
alter table public.verified_emails enable row level security;
revoke all on public.verified_emails from anon, authenticated;

-- ENFORCEMENT (apply LAST, only after the borrow UI's verification step ships,
-- otherwise every borrow fails). Rejects an insert whose email isn't verified:
--
-- create or replace function public.enforce_verified_email()
-- returns trigger language plpgsql security definer set search_path = '' as $$
-- begin
--   if not exists (select 1 from public.verified_emails where email = lower(new.email)) then
--     raise exception 'Email not verified' using errcode = 'check_violation';
--   end if;
--   return new;
-- end; $$;
--
-- create trigger trg_enforce_verified_email
--   before insert on public.pass_records
--   for each row execute function public.enforce_verified_email();
