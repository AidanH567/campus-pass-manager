import { createContext, useContext, useState, ReactNode } from "react";
import { PassRecord } from "@/types/pass";


type PassContextType = {
  passRecords: PassRecord[];
  borrowPass: (studentName: string, email: string, passNumber: string) => void;
  returnPass: (passNumber: string) => boolean;
  markPassOverdue: (passNumber: string) => boolean;
  checkforOverduePasses: () => void;
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

  function borrowPass(studentName: string, email: string, passNumber: string) {
    const newRecord: PassRecord = {
      id: Date.now().toString(),
      studentName,
      email,
      passNumber,
      borrowedAt: getCurrentTime(),
      borrowedDate: getCurrentDate(),
      status: "borrowed",
    };

    setPassRecords((currentRecords) => [newRecord, ...currentRecords]);
  }

  function returnPass(passNumber: string) {
    let foundMatch = false;

    setPassRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.passNumber === passNumber && record.status === "borrowed") {
          foundMatch = true;

          return {
            ...record,
            returnedAt: getCurrentTime(),
            status: "returned",
          };
        }

        return record;
      })
    );

    return foundMatch;
  }

  function markPassOverdue(passNumber: string) {
    let foundMatch = false;

    setPassRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.passNumber === passNumber && record.status === "borrowed") {
          foundMatch = true;
          return {
            ...record,
            status: "overdue",
          };
        }

        return record
      })
    )
    return foundMatch;
  }

  function checkforOverduePasses() {
    const now = new Date();
    const today = getCurrentDate();

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const isAfterCutoff =
      currentHour > 22 || (currentHour === 22 && currentMinute >= 43);

    setPassRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.status === "borrowed" &&
          record.borrowedDate === today &&
          isAfterCutoff) {
          return {
            ...record,
            status: "overdue",
          };
        }

        return record
      })
    );
}

return (
  <PassContext.Provider value={{ passRecords, borrowPass, returnPass, markPassOverdue, checkforOverduePasses }}>
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