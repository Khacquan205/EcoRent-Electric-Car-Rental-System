"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
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

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
