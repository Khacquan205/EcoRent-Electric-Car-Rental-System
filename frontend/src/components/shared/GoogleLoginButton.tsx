"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/services/auth";
import { useAuthSession } from "@/components/providers";
import { buildSessionFromLoginResponse, isTokenExpired } from "@/lib/jwtDecode";
import { ApiError } from "@/services/client";
import { loginWithGoogle } from "@/lib/loginWithGoogle";

type Props = {
  /** Called with an error message when Google login fails */
  onError?: (message: string) => void;
  /** Override redirect target after successful login (default: role-based) */
  redirectTo?: string;
};

/**
 * GoogleLoginButton
 *
 * Dùng Firebase Authentication signInWithPopup - tránh lỗi origin_mismatch của GSI.
 * Sau khi có idToken → gửi lên POST /api/Auth/login-google → lưu session → redirect.
 */
export function GoogleLoginButton({ onError, redirectTo }: Props) {
  const router = useRouter();
  const { setSession } = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const { idToken } = await loginWithGoogle();

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
      const errMsg = err instanceof Error ? err.message : "Đăng nhập Google thất bại.";
      const authErr = err as { code?: string };
      const isCancelled =
        authErr?.code === "auth/popup-closed-by-user" ||
        authErr?.code === "auth/cancelled-popup-request" ||
        String(err).toLowerCase().includes("popup-closed") ||
        String(err).toLowerCase().includes("cancelled");
      if (isCancelled) {
        onError?.("Đăng nhập Google đã bị hủy.");
        return;
      }
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
      onError?.(errMsg);
    } finally {
      setIsLoading(false);
    }
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
    <button
      type="button"
      onClick={handleClick}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E5E5E5] bg-white text-sm font-medium text-[#747474] transition-colors hover:border-[#D1D1D1] hover:bg-gray-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Tiếp tục với Google
    </button>
  );
}
