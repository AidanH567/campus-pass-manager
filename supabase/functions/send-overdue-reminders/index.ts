import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!;

// Berlin wall-clock hour at which overdue passes are marked AND reminder emails
// go out — in a SINGLE daily run (mark borrowed -> overdue and email together).
// Reading the Berlin hour (not UTC) keeps this DST-robust: the cron fires at
// 19:00 and 20:00 UTC so exactly one of those equals 21:00 Berlin in both summer
// (CEST, UTC+2) and winter (CET, UTC+1); the other run is an idempotent no-op.
const REMINDER_HOUR = 21;

type PassRecordRow = {
  id: string;
  student_name: string;
  email: string;
  pass_number: string;
  borrowed_at: string;
  borrowed_date: string;
  returned_at: string | null;
  status: "borrowed" | "returned" | "overdue";
  first_reminder_sent_at: string | null;
  second_reminder_sent_at: string | null;
};

interface ProcessResult {
  id: string;
  pass_number: string;
  email: string;
  action: string;
  reason?: string;
  sentTo?: string | null;
}

function getBerlinDateParts() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function isPreviousBerlinDay(timestamp: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const sentDay = formatter.format(new Date(timestamp));
  const today = formatter.format(new Date());

  return sentDay !== today;
}

function buildReminderHtml(record: PassRecordRow, reminderType: "first" | "second") {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>
        ${
          reminderType === "first"
            ? "Pass return reminder"
            : "Second pass return reminder"
        }
      </h2>

      <p>Hello ${record.student_name},</p>

      <p>
        Our records show that you borrowed pass
        <strong>${record.pass_number}</strong>
        on <strong>${record.borrowed_date}</strong>
        at <strong>${record.borrowed_at}</strong>
        and it has not yet been returned.
      </p>

      <p>
        Campus closes at 6:30 PM. Please return the pass as soon as possible
        to the return box at the front entrance.
      </p>

      <p>Thank you.</p>
    </div>
  `;
}

async function sendReminderEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${errorText}`);
  }

  return await response.json();
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  try {
    // ---- Parse request body / determine run mode ----------------------------
    // Live cron sends `{}`. Test callers can pass any of:
    //   dryRun  : report what WOULD happen — no DB writes, no emails (any time).
    //   force   : ignore the time gate AND the sent-timestamp guard (repeatable).
    //   testEmail: redirect every send to this address so real students are
    //              never emailed; also skips DB writes so it stays repeatable.
    let body: Record<string, unknown> = {};
    try {
      const raw = await req.text();
      if (raw && raw.trim().length > 0) {
        body = JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      body = {};
    }

    const dryRun = body.dryRun === true;
    const force = body.force === true;
    const testEmail =
      typeof body.testEmail === "string" && body.testEmail.includes("@")
        ? body.testEmail
        : null;

    const isTest = dryRun || force || testEmail !== null;
    const liveRun = !isTest;
    const mode = dryRun ? "dryRun" : isTest ? "test" : "live";

    const berlin = getBerlinDateParts();
    const afterReminderHour = berlin.hour >= REMINDER_HOUR;

    // A live cron run only does work at/after REMINDER_HOUR (21:00 Berlin).
    // Test modes bypass this gate so they can be run at any time of day.
    if (liveRun && !afterReminderHour) {
      return json({
        success: true,
        mode,
        reminderHour: REMINDER_HOUR,
        berlinHour: berlin.hour,
        afterReminderHour,
        processed: 0,
        results: [],
        note: "Before REMINDER_HOUR in Berlin — live run is a no-op.",
      });
    }

    const { data, error } = await supabase
      .from("pass_records")
      .select("*")
      .in("status", ["borrowed", "overdue"])
      .is("returned_at", null);

    if (error) {
      throw error;
    }

    const passRecords = (data || []) as PassRecordRow[];
    const results: ProcessResult[] = [];

    for (const record of passRecords) {
      try {
        let currentStatus = record.status;

        // Step 1: any still-borrowed pass becomes overdue. Persist on live runs
        // only; test/dry runs report the intent without mutating the row.
        if (currentStatus === "borrowed") {
          if (liveRun) {
            const { error: overdueError } = await supabase
              .from("pass_records")
              .update({ status: "overdue" })
              .eq("id", record.id);

            if (overdueError) {
              throw overdueError;
            }
          }

          currentStatus = "overdue";

          results.push({
            id: record.id,
            pass_number: record.pass_number,
            email: record.email,
            action: liveRun ? "marked_overdue" : "would_mark_overdue",
          });
        }

        // Step 2: only overdue passes can receive a reminder.
        if (currentStatus !== "overdue") {
          results.push({
            id: record.id,
            pass_number: record.pass_number,
            email: record.email,
            action: "skipped",
            reason: "Pass is not overdue",
          });
          continue;
        }

        // Step 3: decide which reminder. `force` ignores the sent-timestamp
        // guard so a test always produces (and can resend) the first reminder.
        const needsFirstReminder = force || !record.first_reminder_sent_at;
        const needsSecondReminder =
          !force &&
          !!record.first_reminder_sent_at &&
          !record.second_reminder_sent_at &&
          isPreviousBerlinDay(record.first_reminder_sent_at);

        if (!needsFirstReminder && !needsSecondReminder) {
          results.push({
            id: record.id,
            pass_number: record.pass_number,
            email: record.email,
            action: "skipped",
            reason: "Reminder already sent",
          });
          continue;
        }

        const reminderType: "first" | "second" = needsFirstReminder
          ? "first"
          : "second";

        // Recipient: live run -> the real student; any test mode -> testEmail.
        const recipient = liveRun ? record.email : testEmail;

        // dryRun never sends — just report what would have gone out.
        if (dryRun) {
          results.push({
            id: record.id,
            pass_number: record.pass_number,
            email: record.email,
            action: reminderType === "first" ? "would_send_first" : "would_send_second",
            sentTo: null,
          });
          continue;
        }

        // force/test without a testEmail must NEVER email a real student.
        if (recipient === null) {
          results.push({
            id: record.id,
            pass_number: record.pass_number,
            email: record.email,
            action: "skipped",
            reason:
              "Test mode without testEmail — refusing to email real students. Add testEmail to actually send.",
          });
          continue;
        }

        const subjectBase =
          reminderType === "first"
            ? "Please return your Spiced Academy pass"
            : "Second reminder: please return your Spiced Academy pass";
        const subject = liveRun ? subjectBase : `[TEST] ${subjectBase}`;

        await sendReminderEmail(recipient, subject, buildReminderHtml(record, reminderType));

        // Persist the sent-timestamp on live runs only, so tests stay repeatable.
        if (liveRun) {
          const reminderTimestamp = new Date().toISOString();
          const updatePayload =
            reminderType === "first"
              ? { first_reminder_sent_at: reminderTimestamp }
              : { second_reminder_sent_at: reminderTimestamp };

          const { error: updateError } = await supabase
            .from("pass_records")
            .update(updatePayload)
            .eq("id", record.id);

          if (updateError) {
            throw updateError;
          }
        }

        results.push({
          id: record.id,
          pass_number: record.pass_number,
          email: record.email,
          action: liveRun
            ? reminderType === "first"
              ? "first_reminder_sent"
              : "second_reminder_sent"
            : reminderType === "first"
              ? "test_first_reminder_sent"
              : "test_second_reminder_sent",
          sentTo: recipient,
        });
      } catch (recordError) {
        results.push({
          id: record.id,
          pass_number: record.pass_number,
          email: record.email,
          action: "failed",
          reason:
            recordError instanceof Error ? recordError.message : "Unknown error",
        });
      }
    }

    return json({
      success: true,
      mode,
      reminderHour: REMINDER_HOUR,
      berlinHour: berlin.hour,
      afterReminderHour,
      force,
      dryRun,
      testEmail,
      processed: results.length,
      results,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});
