"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as authApi from "@/services/auth";
import { useAuthSession } from "@/components/providers";
import { GoogleLoginButton } from "@/components/shared";
import { buildSessionFromLoginResponse, isTokenExpired } from "@/lib/jwtDecode";

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
      if (!res.success) {
        setMessage(res.message || "Đăng nhập thất bại");
        return;
      }

      if (res.accessToken) {
        if (isTokenExpired(res.accessToken)) {
          setMessage("Login failed: received token is already expired.");
          return;
        }

        const session = buildSessionFromLoginResponse(
          res.accessToken,
          res.expiresIn,
          res.user,
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
      setMessage(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/Logo.png"
                alt="EcoRent Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold text-[#1572D3]">EcoRent</span>
            </Link>

            {/* Header */}
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-[#242424]">
                Welcome back
              </h1>
              <p className="mt-2 text-[#747474]">
                Sign in to your account to continue
              </p>
            </div>

            {/* Social Login */}
            <div className="mt-8">
              <GoogleLoginButton onError={setMessage} />
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#F8FAFC] px-4 text-[#747474]">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-[#242424]">
                  Email address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747474]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-4 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#242424]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#1572D3] hover:text-[#1260B0]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747474]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-12 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
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
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
                <label htmlFor="remember" className="text-sm text-[#747474]">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full bg-[#1572D3] text-white hover:bg-[#1260B0] disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-[#747474]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#1572D3] hover:text-[#1260B0]"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Video Background */}
        <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="/car video/From KlickPin CF Pin by Halit Can on Pins by you _ Fast cars videos Good looking cars Car videos.mp4"
              type="video/mp4"
            />
          </video>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>
    </div>
  );
}
