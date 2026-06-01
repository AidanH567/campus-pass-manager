-- Overdue-reminder automation: cron schedule + the two bugs that stopped it.
--
-- Run these in the Supabase SQL editor (Dashboard -> SQL). They are written to
-- be safe to re-run.
--
-- ROOT CAUSES (why automated emails never sent):
--   1. AUTH: the Vault secret `overdue_reminder_anon_key` held the modern
--      `sb_publishable_...` key, which is NOT a JWT. The function has
--      verify_jwt = true, so every cron call was rejected at the gateway with
--      401 UNAUTHORIZED_INVALID_JWT_FORMAT and the function body never ran.
--      Fix: store the LEGACY anon key (JWT, starts with "eyJ") instead — see step 0.
--   2. TIMING: the function itself gated emails behind a separate 19:00 check
--      while marking overdue at 18:30, so even when it did run it skipped every
--      email. Fixed in index.ts (single run at REMINDER_HOUR = 21:00 Berlin).
--
-- SCHEDULING: pg_cron runs in UTC. The function gates internally on Berlin hour
-- >= 21, so we fire at BOTH 19:00 and 20:00 UTC and let exactly one land on
-- 21:00 Berlin:
--   * Summer (CEST, UTC+2): 19:00 UTC = 21:00 Berlin -> sends; 20:00 UTC = 22:00 -> no-op.
--   * Winter (CET,  UTC+1): 19:00 UTC = 20:00 Berlin -> no-op; 20:00 UTC = 21:00 -> sends.
-- The second run each day is idempotent (timestamps already written), so no
-- student is emailed twice.

-- 0. AUTH FIX — point the Vault secret at the legacy anon JWT (client-safe,
--    RLS-protected). Get it from Dashboard -> Project Settings -> API Keys
--    (the "anon"/legacy key, format eyJ...), or via the management API.
--    Verify the format afterwards: it must start with "eyJ", not "sb_".
select vault.update_secret(
  (select id from vault.secrets where name = 'overdue_reminder_anon_key'),
  '<LEGACY_ANON_JWT_eyJ...>'
);

select
  case
    when decrypted_secret like 'eyJ%' then 'JWT — OK'
    when decrypted_secret like 'sb_%' then 'sb_ publishable — WRONG, cron will 401'
    else 'unknown'
  end as anon_key_format
from vault.decrypted_secrets
where name = 'overdue_reminder_anon_key';

-- 1. Inspect existing jobs. The original job was:
--      jobname  = 'send-overdue-reminders-daily'
--      schedule = '*/15 16-21 * * *'   (every 15 min, 16-21 UTC)
select jobid, jobname, schedule, active, command
from cron.job
order by jobid;

-- 2. Remove the old job and any previous copy of the new one (safe no-ops if absent).
select cron.unschedule(jobid)
from cron.job
where jobname in ('send-overdue-reminders-daily', 'send-overdue-reminders-9pm');

-- 3. Schedule the new job: 19:00 and 20:00 UTC, every day.
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

-- 4. Verify the job is registered and active.
select jobid, jobname, schedule, active
from cron.job
where jobname = 'send-overdue-reminders-9pm';

-- 5. Smoke-test the cron path WITHOUT sending email: invoke through the same
--    Vault-resolved URL/key the cron uses, but with a dry-run body. Then read
--    the response — status_code must be 200 (not 401).
select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'overdue_reminder_function_url'),
  headers := jsonb_build_object(
    'Content-type', 'application/json',
    'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'overdue_reminder_anon_key')
  ),
  body := '{"dryRun": true}'::jsonb
) as request_id;
-- ...then (using the request_id above):
-- select id, status_code, content from net._http_response where id = <request_id>;

-- 6. After the next 19:00/20:00 UTC run, check execution history here.
select jobid, status, return_message, start_time, end_time
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'send-overdue-reminders-9pm')
order by start_time desc
limit 10;
