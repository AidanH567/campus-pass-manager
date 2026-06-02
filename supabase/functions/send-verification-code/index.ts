import { createClient } from "npm:@supabase/supabase-js@2";

// Sends a 6-digit email-verification code (service role). Public endpoint.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!;

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendCodeEmail(to: string, code: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Your verification code</h2>
      <p>Use this code to verify your email so you can borrow a Spiced Academy pass:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: "Your Spiced Academy verification code",
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    let body: Record<string, unknown> = {};
    try {
      const raw = await req.text();
      if (raw && raw.trim().length > 0) body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isValidEmail(email)) return json({ error: "A valid email is required." }, 400);

    // Already verified -> nothing to do.
    const { data: already } = await supabase
      .from("verified_emails")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (already) return json({ alreadyVerified: true });

    // 60-second resend cooldown (basic anti-spam).
    const { data: existing } = await supabase
      .from("email_verifications")
      .select("last_sent_at")
      .eq("email", email)
      .maybeSingle();
    if (existing && Date.now() - new Date(existing.last_sent_at).getTime() < 60_000) {
      return json({ error: "Please wait a minute before requesting another code." }, 429);
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: upsertErr } = await supabase.from("email_verifications").upsert({
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      last_sent_at: new Date().toISOString(),
    });
    if (upsertErr) throw upsertErr;

    await sendCodeEmail(email, code);
    return json({ sent: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
