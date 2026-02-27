"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import * as authApi from "@/services/auth";
import { useAuthSession } from "@/components/providers";
import { buildSessionFromLoginResponse, isTokenExpired } from "@/lib/jwtDecode";

type Props = {
  /** Called with an error message when Google login fails */
  onError?: (message: string) => void;
  /** Override redirect target after successful login (default: role-based) */
  redirectTo?: string;
};

/**
 * GoogleLoginButton
 *
 * Renders Google's official Sign-In button.
 * On credential received → sends idToken to POST /api/Auth/login-google
 * → stores session in cookie via AuthSessionProvider
 * → redirects based on roleCode in JWT claims.
 *
 * Plugs into the same auth system as normal email/password login.
 */
export function GoogleLoginButton({ onError, redirectTo }: Props) {
  const router = useRouter();
  const { setSession } = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);

  async function handleCredential(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      onError?.("Google login failed: no credential received.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.loginGoogle({ idToken });

      if (!res.success) {
        onError?.(res.message || "Google login failed.");
        return;
      }

      if (!res.accessToken) {
        onError?.("Google login failed: no access token returned.");
        return;
      }

      if (isTokenExpired(res.accessToken)) {
        onError?.("Google login failed: received token is already expired.");
        return;
      }

      const session = buildSessionFromLoginResponse(
        res.accessToken,
        res.expiresIn,
        res.user,
      );

      setSession(session);

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      const roleCode = session.role?.toUpperCase();
      if (roleCode === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Google login failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleError() {
    onError?.("Google sign-in was cancelled or failed.");
  }

  if (isLoading) {
    return (
      <div className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E5E5E5] bg-white text-sm font-medium text-[#747474]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1572D3] border-t-transparent" />
        Signing in with Google...
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <GoogleLogin
        onSuccess={handleCredential}
        onError={handleGoogleError}
        width={350}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
}
