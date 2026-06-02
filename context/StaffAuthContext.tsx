import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

// 30-minute staff session. Persisted to localStorage on web (so a refresh
// doesn't drop the session) with an in-memory fallback on native. Auto-expires.
const STORAGE_KEY = "staff_session_expires_at";
const SESSION_MS = 30 * 60 * 1000;

const memory: Record<string, string | null> = {};
const sessionStore = {
  get(key: string): string | null {
    try {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : memory[key] ?? null;
    } catch {
      return memory[key] ?? null;
    }
  },
  set(key: string, value: string) {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      else memory[key] = value;
    } catch {
      memory[key] = value;
    }
  },
  remove(key: string) {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      else delete memory[key];
    } catch {
      delete memory[key];
    }
  },
};

type StaffAuthContextType = {
  isStaffAuthenticated: boolean;
  authenticateStaff: () => void;
  clearStaffAuthentication: () => void;
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);

  // Restore a non-expired session on load.
  useEffect(() => {
    const raw = sessionStore.get(STORAGE_KEY);
    const expiresAt = raw ? Number(raw) : 0;
    if (expiresAt && expiresAt > Date.now()) {
      setIsStaffAuthenticated(true);
    } else if (raw) {
      sessionStore.remove(STORAGE_KEY);
    }
  }, []);

  // Auto-expire while authenticated.
  useEffect(() => {
    if (!isStaffAuthenticated) return;
    const raw = sessionStore.get(STORAGE_KEY);
    const expiresAt = raw ? Number(raw) : 0;
    const remaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : SESSION_MS;
    const timer = setTimeout(() => {
      sessionStore.remove(STORAGE_KEY);
      setIsStaffAuthenticated(false);
    }, remaining);
    return () => clearTimeout(timer);
  }, [isStaffAuthenticated]);

  function authenticateStaff() {
    sessionStore.set(STORAGE_KEY, String(Date.now() + SESSION_MS));
    setIsStaffAuthenticated(true);
  }

  function clearStaffAuthentication() {
    sessionStore.remove(STORAGE_KEY);
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
