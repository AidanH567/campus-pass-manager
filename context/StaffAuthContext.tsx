import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type StaffAuthContextType = {
  isStaffAuthenticated: boolean;
  authenticateStaff: () => void;
  clearStaffAuthentication: () => void;
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(
  undefined
);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);

  function authenticateStaff() {
    setIsStaffAuthenticated(true);
  }

  function clearStaffAuthentication() {
    setIsStaffAuthenticated(false);
  }

  return (
    <StaffAuthContext.Provider
      value={{
        isStaffAuthenticated,
        authenticateStaff,
        clearStaffAuthentication,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuthContext() {
  const context = useContext(StaffAuthContext);

  if (!context) {
    throw new Error("useStaffAuthContext must be used within a StaffAuthProvider");
  }

  return context;
}
