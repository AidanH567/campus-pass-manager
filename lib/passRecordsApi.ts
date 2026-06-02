import { supabase } from "@/lib/supabase";

// Columns the public/anon key is allowed to read — deliberately excludes `email`.
// Email is locked down at the database (column privilege revoked from anon); any
// read of it happens server-side via the borrow-check Edge Function (service role).
const SAFE_COLUMNS =
  "id, student_name, pass_number, borrowed_at, borrowed_date, returned_at, status, created_at, first_reminder_sent_at, second_reminder_sent_at";

export async function fetchPassRecordsFromDb() {
  return await supabase
    .from("pass_records")
    .select(SAFE_COLUMNS)
    .order("created_at", { ascending: false });
}

export async function createPassRecordInDb(record: {
  student_name: string;
  email: string;
  pass_number: string;
  borrowed_at: string;
  borrowed_date: string;
  status: "borrowed" | "returned" | "overdue";
}) {
  // No `.select()` back: we must not read the email column we just wrote.
  return await supabase.from("pass_records").insert(record);
}

export async function markPassReturnedInDb(passNumber: string, returnedAt: string) {
  return await supabase
    .from("pass_records")
    .update({ returned_at: returnedAt, status: "returned" })
    .eq("pass_number", passNumber)
    .eq("status", "borrowed")
    .select("id");
}

export async function markPassOverdueInDb(passNumber: string) {
  return await supabase
    .from("pass_records")
    .update({ status: "overdue" })
    .eq("pass_number", passNumber)
    .eq("status", "borrowed")
    .select("id");
}

export type BorrowCheckResult = {
  emailHasActivePass: boolean;
  passInUse: boolean;
  existingName: string | null;
};

// Server-side availability check (service role) so the public key never reads
// emails. Returns only booleans + an optional name — never raw rows.
export async function borrowCheck(email: string, passNumber: string) {
  return await supabase.functions.invoke<BorrowCheckResult>("borrow-check", {
    body: { email: email.trim().toLowerCase(), passNumber: passNumber.trim() },
  });
}
