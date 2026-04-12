import { supabase } from "@/lib/supabase";

export async function fetchPassRecordsFromDb() {
    return await supabase
        .from("pass_records")
        .select("*")
        .order("created_at", { ascending: false })
}

export async function createPassRecordInDb(record: {
    student_name: string;
    email: string;
    pass_number: string;
    borrowed_at: string;
    borrowed_date: string;
    status: "borrowed" | "returned" | "overdue";
}) {
    return await supabase
        .from("pass_records")
        .insert(record)
        .select()
        .single()
}

export async function markPassReturnedInDb(
    passNumber: string,
    returnedAt: string
) {
    return await supabase
        .from("pass_records")
        .update({
            returned_at: returnedAt,
            status: "returned"
        })
        .eq("pass_number", passNumber)
        .eq("status", "borrowed")
        .select();
}

export async function markPassOverdueInDb(passNumber: string) {
  return await supabase
    .from("pass_records")
    .update({
      status: "overdue",
    })
    .eq("pass_number", passNumber)
    .eq("status", "borrowed")
    .select();
}

export async function findLatestPassRecordByEmail(email: string) {
  return await supabase
    .from("pass_records")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
}