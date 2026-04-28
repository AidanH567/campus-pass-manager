import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type StaffAuthContextType = {
  isStaffAuthenticated: boolean;
  unlockStaff: () => void;
  lockStaff: () => void;
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);

  function unlockStaff() {
    setIsStaffAuthenticated(true);
  }

  function lockStaff() {
    setIsStaffAuthenticated(false);
  }

  return (
    <StaffAuthContext.Provider
      value={{ isStaffAuthenticated, unlockStaff, lockStaff }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);

  if (!context) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }

  return context;
}