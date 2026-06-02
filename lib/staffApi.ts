import { supabase } from "@/lib/supabase";

// Verifies the staff passcode server-side. The passcode hash lives in the
// database (readable only by the SECURITY DEFINER verifier) — never in the
// client bundle or the repo. Returns { ok } where ok = passcode correct.
export async function verifyStaffPasscode(passcode: string) {
  const { data, error } = await supabase.rpc("verify_staff_passcode", {
    p: passcode,
  });
  return { ok: data === true, error };
}
