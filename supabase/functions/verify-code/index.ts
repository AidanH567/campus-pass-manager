import { createClient } from "npm:@supabase/supabase-js@2";

// Verifies a 6-digit email code (service role). On success, records the email
// as verified (remembered) so the student never re-verifies. Public endpoint.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    status,
  });
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ verified: false, error: "Method not allowed" }, 405);

  try {
    let body: Record<string, unknown> = {};
    try {
      const raw = await req.text();
      if (raw && raw.trim().length > 0) body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return json({ verified: false, error: "Invalid JSON body" }, 400);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!email || !code) return json({ verified: false, error: "Email and code are required." }, 400);

    const { data: row, error } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;

    if (!row) return json({ verified: false, error: "No code found — request a new one." });
    if (new Date(row.expires_at).getTime() < Date.now())
      return json({ verified: false, error: "Code expired — request a new one." });
    if (row.attempts >= 5)
      return json({ verified: false, error: "Too many attempts — request a new code." });

    const inputHash = await sha256Hex(code);
    if (inputHash !== row.code_hash) {
      await supabase
        .from("email_verifications")
        .update({ attempts: row.attempts + 1 })
        .eq("email", email);
      return json({ verified: false, error: "Incorrect code." });
    }

    await supabase.from("verified_emails").upsert({ email, verified_at: new Date().toISOString() });
    await supabase.from("email_verifications").delete().eq("email", email);

    return json({ verified: true });
  } catch (error) {
    return json({ verified: false, error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
