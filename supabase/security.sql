-- Email privacy lockdown for public.pass_records
--
-- The anon/publishable key is public by design (it ships in the client). These
-- column privileges ensure it cannot READ or TAMPER WITH the student email.
-- Email is only ever read server-side by the `borrow-check` and
-- `send-overdue-reminders` Edge Functions, which run with the service-role key.
--
-- ⚠️ Run these ONLY AFTER the email-free client is the version in use
-- (the client no longer does `select *` — it selects an explicit column set
-- without email and routes email checks through borrow-check). If the old
-- `select *` client is still running, it will error after this.

-- 1) Stop the public/anon key from READING the email column.
revoke select (email) on public.pass_records from anon, authenticated;

-- 2) Stop the public/anon key from OVERWRITING email or the reminder columns.
--    (The app only updates status + returned_at via anon; reminder writes are
--     done server-side with the service role.)
revoke update (email, first_reminder_sent_at, second_reminder_sent_at)
  on public.pass_records from anon, authenticated;

-- 3) Verify: anon/authenticated should have NO privileges left on the email column.
select grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'pass_records'
  and column_name = 'email'
order by grantee, privilege_type;
