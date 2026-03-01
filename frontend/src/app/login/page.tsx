"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as authApi from "@/services/auth";
import { useAuthSession } from "@/components/providers";
import { GoogleLoginButton } from "@/components/shared";
import { buildSessionFromLoginResponse, isTokenExpired } from "@/lib/jwtDecode";
import { ApiError } from "@/services/client";
import bgImage from "@/assets/bgLoginSignup.jpg";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.login({ email, password });
      const norm = authApi.normalizeAuthResponse(res as Record<string, unknown>);
      if (!norm.success) {
        setMessage(norm.message || "Đăng nhập thất bại");
        return;
      }

      if (norm.accessToken) {
        if (isTokenExpired(norm.accessToken)) {
          setMessage("Token đã hết hạn. Vui lòng đăng nhập lại.");
          return;
        }

        const session = buildSessionFromLoginResponse(
          norm.accessToken,
          norm.expiresIn,
          norm.user,
        );
        setSession({ ...session, email: session.email ?? email });

        if (session.role?.toUpperCase() === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setSession(null);
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 503) {
          setMessage(
            "Không kết nối được máy chủ. Hãy chắc chắn backend đã chạy và đúng port (mặc định 5084)."
          );
          return;
        }
        if (err.body && typeof err.body === "object") {
          const b = err.body as { message?: string; Message?: string };
          setMessage(String(b.message ?? b.Message ?? err.message));
          return;
        }
      }
      setMessage(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden px-4">
      {/* Background image — shared with signup */}
      <Image
        src={bgImage}
        alt=""
        fill
        className="scale-105 object-cover blur-md"
        priority
        quality={60}
      />

      {/* Overlay — darkens image so form card pops */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Back to home — always clear above blur */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-lg backdrop-blur-md transition-colors hover:bg-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Về trang chủ</span>
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-8 shadow-xl shadow-slate-200/50">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="EcoRent Logo"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-xl font-black text-[#1572D3]">EcoRent</span>
          </Link>

          {/* Header */}
          <div className="mt-5">
            <h1 className="text-xl font-semibold text-[#242424]">
              Welcome back
            </h1>
            <p className="mt-1 text-xs text-[#747474]">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-5">
            <GoogleLoginButton onError={setMessage} />
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2.5 text-[11px] text-slate-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[#242424]">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747474]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E5E5] py-2.5 pl-9 pr-3 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-[#242424]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#1572D3] hover:text-[#1260B0]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747474]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E5E5] py-2.5 pl-9 pr-10 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747474] hover:text-[#242424]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {message && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                {message}
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-[#E5E5E5] text-[#1572D3] focus:ring-[#1572D3]"
              />
              <label htmlFor="remember" className="text-xs text-[#747474]">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-10 w-full bg-[#1572D3] text-sm font-medium text-white hover:bg-[#1260B0] disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#1572D3] hover:text-[#1260B0]"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Brand note */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Zap className="h-3.5 w-3.5 text-[#1572D3]" />
          Nền tảng thuê xe điện P2P đầu tiên tại Việt Nam
        </p>
      </div>
    </div>
  );
}
