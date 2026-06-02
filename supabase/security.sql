-- Security lockdown for public.pass_records (APPLIED to the live database).
--
-- The anon/publishable key is public by design (it ships in the client). These
-- grants + policies ensure that key cannot read student emails, cannot tamper
-- with emails/reminder timestamps, and can only perform the two legitimate
-- write operations (borrow a pass; return/overdue an active pass). Email is read
-- only server-side by the borrow-check and send-overdue-reminders Edge Functions
-- (service role).

-- 1) READS — a table-level GRANT implies every column, so a column-level REVOKE
--    is a NO-OP. Drop the table-level SELECT, then re-grant only the
--    non-sensitive columns (note: no `email`).
revoke select on public.pass_records from anon, authenticated;
grant select (
  id, student_name, pass_number, borrowed_at, borrowed_date,
  returned_at, status, created_at, first_reminder_sent_at, second_reminder_sent_at
) on public.pass_records to anon, authenticated;

-- 2) WRITES — anon may only update the two columns the app actually changes.
revoke update on public.pass_records from anon, authenticated;
grant update (status, returned_at) on public.pass_records to anon, authenticated;

-- 3) Constrain the row policies (the permissive USING/CHECK = true were flagged
--    by the Supabase linter). INSERT: only fresh borrowed rows. UPDATE: only
--    active passes, only into a valid status.
drop policy if exists "anon can insert pass records" on public.pass_records;
create policy "anon can insert borrowed pass" on public.pass_records
  for insert to anon
  with check (status = 'borrowed' and returned_at is null);

drop policy if exists "anon can update pass records" on public.pass_records;
create policy "anon can update active pass" on public.pass_records
  for update to anon
  using (status in ('borrowed', 'overdue'))
  with check (status in ('borrowed', 'overdue', 'returned'));

-- Verify: anon should have NO SELECT/UPDATE on the email column (INSERT is kept
-- so a borrower can still write their own email).
select privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'pass_records'
  and grantee = 'anon' and column_name = 'email'
order by privilege_type;
