"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import * as authApi from "@/services/auth";
import { useAuthSession } from "@/components/providers";
import { buildSessionFromLoginResponse, isTokenExpired } from "@/lib/jwtDecode";
import { ApiError } from "@/services/client";

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
      const norm = authApi.normalizeAuthResponse(res as Record<string, unknown>);

      if (!norm.success) {
        onError?.(norm.message || "Đăng nhập Google thất bại.");
        return;
      }

      if (!norm.accessToken) {
        onError?.("Đăng nhập Google thất bại: không nhận được token.");
        return;
      }

      if (isTokenExpired(norm.accessToken)) {
        onError?.("Token đã hết hạn. Vui lòng thử lại.");
        return;
      }

      const session = buildSessionFromLoginResponse(
        norm.accessToken,
        norm.expiresIn,
        norm.user,
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
      if (err instanceof ApiError) {
        if (err.status === 503) {
          onError?.("Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.");
          return;
        }
        if (err.body && typeof err.body === "object") {
          const b = err.body as { message?: string; Message?: string };
          onError?.(String(b.message ?? b.Message ?? err.message));
          return;
        }
      }
      onError?.(err instanceof Error ? err.message : "Đăng nhập Google thất bại.");
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
