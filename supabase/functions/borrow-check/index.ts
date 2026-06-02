import { createClient } from "npm:@supabase/supabase-js@2";

// Server-side borrow pre-check. Runs with the service-role key so it can read
// the `email` column (which the public/anon key is NOT allowed to read).
// Returns only minimal, non-sensitive results — never raw rows of other users.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// CORS: this endpoint is called from the browser (web build / Vercel), so it
// must answer the preflight and send these headers on every response.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CheckResult = {
  emailHasActivePass: boolean;
  passInUse: boolean;
  existingName: string | null;
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      const raw = await req.text();
      if (raw && raw.trim().length > 0) {
        body = JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const passNumber =
      typeof body.passNumber === "string" ? body.passNumber.trim() : "";

    if (!email) {
      return json({ error: "email is required" }, 400);
    }

    // Outstanding passes (borrowed or overdue, not yet returned).
    const { data: active, error: activeError } = await supabase
      .from("pass_records")
      .select("email, pass_number")
      .in("status", ["borrowed", "overdue"])
      .is("returned_at", null);
    if (activeError) throw activeError;

    const rows = active ?? [];
    const emailHasActivePass = rows.some(
      (r) => (r.email ?? "").toLowerCase() === email
    );
    const passInUse =
      passNumber.length > 0 &&
      rows.some((r) => (r.pass_number ?? "").trim() === passNumber);

    // Latest record for this email -> name, to hydrate a returning borrower.
    const { data: latest, error: latestError } = await supabase
      .from("pass_records")
      .select("student_name")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError) throw latestError;

    const result: CheckResult = {
      emailHasActivePass,
      passInUse,
      existingName: latest?.student_name ?? null,
    };

    return json(result);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});
