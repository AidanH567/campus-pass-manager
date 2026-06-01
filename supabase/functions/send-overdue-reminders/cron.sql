-- Reschedule the overdue-reminder sweep to a single 21:00 Berlin run.
--
-- pg_cron runs in UTC. The function gates internally on Berlin hour >= 21
-- (REMINDER_HOUR in index.ts), so we fire at BOTH 19:00 and 20:00 UTC and let
-- exactly one of them land on 21:00 Berlin:
--   * Summer (CEST, UTC+2): 19:00 UTC = 21:00 Berlin -> sends; 20:00 UTC = 22:00 -> no-op.
--   * Winter (CET,  UTC+1): 19:00 UTC = 20:00 Berlin -> no-op; 20:00 UTC = 21:00 -> sends.
-- The second run each day is idempotent (timestamps already written), so no
-- student is emailed twice. This is what makes the 9pm send DST-robust.
--
-- Run these statements in the Supabase SQL editor (Dashboard -> SQL).

-- 1. Inspect existing jobs. Note the jobid/jobname of the OLD overdue job
--    (the one that fired ~18:30 Berlin) so you can remove it in step 2.
select jobid, jobname, schedule, active, command
from cron.job
order by jobid;

-- 2. Remove the OLD overdue job. Replace <OLD_JOB_NAME> with the name you saw
--    above (e.g. the previous reminder job). Safe no-op if it doesn't exist.
select cron.unschedule(jobid)
from cron.job
where jobname = '<OLD_JOB_NAME>';

-- 3. Remove any previous copy of THIS job so re-running the script is idempotent.
select cron.unschedule(jobid)
from cron.job
where jobname = 'send-overdue-reminders-9pm';

-- 4. Schedule the new job: 19:00 and 20:00 UTC, every day.
select cron.schedule(
  'send-overdue-reminders-9pm',
  '0 19,20 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'overdue_reminder_function_url'),
    headers := jsonb_build_object(
      'Content-type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'overdue_reminder_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 5. Verify the job is registered and active.
select jobid, jobname, schedule, active
from cron.job
where jobname = 'send-overdue-reminders-9pm';

-- 6. After the next 19:00/20:00 UTC run, check execution history here.
select jobid, status, return_message, start_time, end_time
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'send-overdue-reminders-9pm')
order by start_time desc
limit 10;
