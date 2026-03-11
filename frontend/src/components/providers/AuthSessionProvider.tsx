"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  AuthSession,
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "@/lib/authSession";

type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const cookie = getSessionCookie();
      Promise.resolve().then(() => setSessionState(cookie));
    }
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

  // Must match backend Google:ClientId (appsettings.json). Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local to override.
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    "817931884201-4gqdq87vk385re6q9c6mh669m9rj2s8n.apps.googleusercontent.com";

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
