"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthSession, clearSessionCookie, getSessionCookie, setSessionCookie } from "@/lib/authSession";

type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSessionState(getSessionCookie());
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      setSession: (next) => {
        if (next) setSessionCookie(next);
        else clearSessionCookie();
        setSessionState(next);
      },
      logout: () => {
        clearSessionCookie();
        setSessionState(null);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
