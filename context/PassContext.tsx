import {
  borrowCheck,
  createPassRecordInDb,
  fetchPassRecordsFromDb,
  markPassOverdueInDb,
  markPassReturnedInDb,
} from "@/lib/passRecordsApi";
import { PassRecord } from "@/types/pass";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Result of a mutation so screens can tell apart:
//   ok=true               -> succeeded
//   ok=false, error=null  -> completed but no row matched (not found / already active)
//   ok=false, error="..." -> a message to surface to the user
export type MutationResult = {
  ok: boolean;
  error: string | null;
};

type PassContextType = {
  passRecords: PassRecord[];
  borrowPass: (studentName: string, email: string, passNumber: string) => Promise<MutationResult>;
  returnPass: (passNumber: string) => Promise<MutationResult>;
  markPassOverdue: (passNumber: string) => Promise<MutationResult>;
  checkForOverduePasses: () => Promise<void>;
  borrowPassWithExistingEmail: (email: string, passNumber: string) => Promise<MutationResult>;
};

const PassContext = createContext<PassContextType | undefined>(undefined);

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getCurrentDate() {
  // Explicit DD/MM/YYYY so the stored value is locale-independent.
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

const CHECK_FAILED = "Could not verify pass availability. Please try again.";

export function PassProvider({ children }: { children: ReactNode }) {
  const [passRecords, setPassRecords] = useState<PassRecord[]>([]);

  useEffect(() => {
    fetchPassRecords();
  }, []);

  async function fetchPassRecords() {
    const { data, error } = await fetchPassRecordsFromDb();

    if (error) {
      console.error("Error fetching pass records: ", error);
      return;
    }

    const mappedRecords: PassRecord[] = (data || []).map((record) => ({
      id: record.id,
      studentName: record.student_name,
      passNumber: record.pass_number,
      borrowedAt: record.borrowed_at,
      borrowedDate: record.borrowed_date,
      returnedAt: record.returned_at,
      status: record.status,
      firstReminderSentAt: record.first_reminder_sent_at,
      secondReminderSentAt: record.second_reminder_sent_at,
    }));

    setPassRecords(mappedRecords);
  }

  async function borrowPass(
    studentName: string,
    email: string,
    passNumber: string
  ): Promise<MutationResult> {
    const { data: check, error: checkError } = await borrowCheck(email, passNumber);
    if (checkError || !check) {
      console.error("borrow-check failed:", checkError);
      return { ok: false, error: CHECK_FAILED };
    }
    if (check.passInUse) {
      return { ok: false, error: "That pass is already checked out." };
    }
    if (check.emailHasActivePass) {
      return {
        ok: false,
        error: "You already have an active pass. Return it before borrowing another.",
      };
    }

    const { error } = await createPassRecordInDb({
      student_name: studentName.trim(),
      email: email.trim().toLowerCase(),
      pass_number: passNumber.trim(),
      borrowed_at: getCurrentTime(),
      borrowed_date: getCurrentDate(),
      status: "borrowed",
    });
    if (error) {
      console.error("Error creating pass record:", error);
      return { ok: false, error: error.message ?? "Could not save the borrow record." };
    }

    await fetchPassRecords();
    return { ok: true, error: null };
  }

  async function borrowPassWithExistingEmail(
    email: string,
    passNumber: string
  ): Promise<MutationResult> {
    const { data: check, error: checkError } = await borrowCheck(email, passNumber);
    if (checkError || !check) {
      console.error("borrow-check failed:", checkError);
      return { ok: false, error: CHECK_FAILED };
    }
    if (check.passInUse) {
      return { ok: false, error: "That pass is already checked out." };
    }
    if (check.emailHasActivePass) {
      return {
        ok: false,
        error: "You already have an active pass. Return it before borrowing another.",
      };
    }
    if (!check.existingName) {
      // No prior borrower for this email -> let the screen offer the new-borrower form.
      return { ok: false, error: null };
    }

    const { error: createError } = await createPassRecordInDb({
      student_name: check.existingName,
      email: email.trim().toLowerCase(),
      pass_number: passNumber.trim(),
      borrowed_at: getCurrentTime(),
      borrowed_date: getCurrentDate(),
      status: "borrowed",
    });
    if (createError) {
      console.error("Error creating pass record for existing borrower:", createError);
      return { ok: false, error: createError.message ?? "Could not save the borrow record." };
    }

    await fetchPassRecords();
    return { ok: true, error: null };
  }

  async function returnPass(passNumber: string): Promise<MutationResult> {
    const { data, error } = await markPassReturnedInDb(passNumber, getCurrentTime());
    if (error) {
      console.error("Error returning pass:", error);
      return { ok: false, error: error.message ?? "Could not return the pass." };
    }
    await fetchPassRecords();
    return { ok: !!data && data.length > 0, error: null };
  }

  async function markPassOverdue(passNumber: string): Promise<MutationResult> {
    const { data, error } = await markPassOverdueInDb(passNumber);
    if (error) {
      console.error("Error marking pass overdue:", error);
      return { ok: false, error: error.message ?? "Could not mark the pass overdue." };
    }
    await fetchPassRecords();
    return { ok: !!data && data.length > 0, error: null };
  }

  async function checkForOverduePasses() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isAfterCutoff = currentHour > 18 || (currentHour === 18 && currentMinute >= 30);
    if (!isAfterCutoff) return;

    const overdueCandidates = passRecords.filter(
      (record) => record.status === "borrowed" && !record.returnedAt
    );
    if (overdueCandidates.length === 0) return;

    for (const record of overdueCandidates) {
      const { error } = await markPassOverdueInDb(record.passNumber);
      if (error) {
        console.error("Error marking overdue:", error);
      }
    }

    await fetchPassRecords();
  }

  return (
    <PassContext.Provider
      value={{
        passRecords,
        borrowPass,
        returnPass,
        markPassOverdue,
        checkForOverduePasses,
        borrowPassWithExistingEmail,
      }}
    >
      {children}
    </PassContext.Provider>
  );
}

export function usePassContext() {
  const context = useContext(PassContext);

  if (!context) {
    throw new Error("usePassContext must be used within a PassProvider");
  }

  return context;
}
