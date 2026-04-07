import { createContext, useContext, useState, ReactNode } from "react";

type PassRecord = {
  id: string;
  studentName: string;
  email: string;
  passNumber: string;
  checkedOutAt: string;
  returnedAt?: string;
  status: "borrowed" | "returned" | "overdue";
};

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
  const [passRecords, setPassRecords] = useState<PassRecord[]>([
    {
      id: "1",
      studentName: "Aidan",
      email: "aidan@example.com",
      passNumber: "3",
      checkedOutAt: "09:05",
      status: "borrowed",
    },
    {
      id: "2",
      studentName: "Mia",
      email: "mia@example.com",
      passNumber: "7",
      checkedOutAt: "10:15",
      returnedAt: "14:40",
      status: "returned",
    },
    {
      id: "3",
      studentName: "Sam",
      email: "sam@example.com",
      passNumber: "2",
      checkedOutAt: "08:50",
      status: "overdue",
    },
  ]);

  function borrowPass(studentName: string, email: string, passNumber: string) {
    const newRecord: PassRecord = {
      id: Date.now().toString(),
      studentName,
      email,
      passNumber,
      checkedOutAt: getCurrentTime(),
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