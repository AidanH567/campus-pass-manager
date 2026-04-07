import { createContext, useContext, useState, ReactNode } from "react";
import { PassRecord } from "@/types/pass";


type PassContextType = {
  passRecords: PassRecord[];
  borrowPass: (studentName: string, email: string, passNumber: string) => void;
  returnPass: (passNumber: string) => boolean;
};

const PassContext = createContext<PassContextType | undefined>(undefined);

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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

  return (
    <PassContext.Provider value={{ passRecords, borrowPass, returnPass }}>
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