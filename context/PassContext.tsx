import {
  createPassRecordInDb,
  fetchPassRecordsFromDb,
  findLatestPassRecordByEmail,
  markPassOverdueInDb,
  markPassReturnedInDb
} from "@/lib/passRecordsApi";
import { PassRecord } from "@/types/pass";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";


type PassContextType = {
  passRecords: PassRecord[];
  borrowPass: (studentName: string, email: string, passNumber: string) => Promise<boolean>;
  returnPass: (passNumber: string) => Promise<boolean>;
  markPassOverdue: (passNumber: string) => Promise<boolean>;
  checkForOverduePasses: () => Promise<void>;
  borrowPassWithExistingEmail: (email: string, passNumber: string) => Promise<boolean>;
};

const PassContext = createContext<PassContextType | undefined>(undefined);

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCurrentDate() {
  return new Date().toLocaleDateString();
}

export function PassProvider({ children }: { children: ReactNode }) {
  const [passRecords, setPassRecords] = useState<PassRecord[]>([]);

  useEffect(() => {
    fetchPassRecords();
  }, []);

  async function fetchPassRecords() {
    const { data, error } = await fetchPassRecordsFromDb();

    if (error) {
      console.error("Error fetch pass records: ", error)
      return;
    }

    const mappedRecords: PassRecord[] = (data || []).map((record) => ({
      id: record.id,
      studentName: record.student_name,
      email: record.email,
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

    function hasActivePassForStudent(email: string) {
    return passRecords.some(
      (record) =>
        record.email.toLowerCase() === email.trim().toLowerCase() &&
        (record.status === "borrowed" || record.status === "overdue")
    );
  }

  function isPassCurrentlyInUse(passNumber: string) {
    return passRecords.some(
      (record) =>
        record.passNumber.trim() === passNumber.trim() &&
        (record.status === "borrowed" || record.status === "overdue")
    );
  }


  async function borrowPassWithExistingEmail(email: string, passNumber: string) {

    if (hasActivePassForStudent(email) || isPassCurrentlyInUse(passNumber)) {
      return false;
    }
    
    const { data, error } = await findLatestPassRecordByEmail(email);

    if (error || !data) {
      console.error("No previous borrower found for that email:", error);
      return false;
    }

    const { error: createError } = await createPassRecordInDb({
      student_name: data.student_name,
      email: data.email,
      pass_number: passNumber,
      borrowed_at: getCurrentTime(),
      borrowed_date: getCurrentDate(),
      status: "borrowed",
    });

    if (createError) {
      console.error("Error creating pass record for existing borrower:", createError);
      return false;
    }

    await fetchPassRecords();
    return true;
  }

  async function borrowPass(studentName: string, email: string, passNumber: string) {
    const { error } = await createPassRecordInDb({
      student_name: studentName,
      email,
      pass_number: passNumber,
      borrowed_at: getCurrentTime(),
      borrowed_date: getCurrentDate(),
      status: "borrowed",
    });

    if (error) {
      console.error("Error creating pass record:", error);
      return;
    }

    await fetchPassRecords();
  }

  async function returnPass(passNumber: string) {
    const { data, error } = await markPassReturnedInDb(
      passNumber,
      getCurrentTime()
    );

    if (error) {
      console.error("Error returning pass:", error);
      return false;
    }

    await fetchPassRecords();

    return !!data && data.length > 0;
  }

  async function markPassOverdue(passNumber: string) {
    const { data, error } = await markPassOverdueInDb(passNumber);

    if (error) {
      console.error("Error marking pass overdue:", error);
      return false;
    }

    await fetchPassRecords();

    return !!data && data.length > 0;
  }

  async function checkForOverduePasses() {
    const now = new Date();
    const today = getCurrentDate();

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isAfterCutoff =
      currentHour > 19 || (currentHour === 19 && currentMinute >= 10);

    if (!isAfterCutoff) return;

    const overdueCandidates = passRecords.filter(
      (record) =>
        record.status === "borrowed" &&
        record.borrowedDate === today
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
    <PassContext.Provider value={{
      passRecords,
      borrowPass,
      returnPass,
      markPassOverdue,
      checkForOverduePasses,
      borrowPassWithExistingEmail
    }}>
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