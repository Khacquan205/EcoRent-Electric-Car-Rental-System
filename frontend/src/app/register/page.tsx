"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as authApi from "@/lib/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.register({
        email: formData.email,
        password: formData.password,
      });
      if (!res.success) {
        setMessage(res.message || "Registration failed");
        return;
      }
      setMessage(
        res.message ||
          "Registration successful. Please enter the OTP sent to your email.",
      );
      setShowOtpForm(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.verifyRegistration({
        email: formData.email,
        code: otp,
      });
      if (!res.success) {
        setMessage(res.message || "Verification failed");
        return;
      }
      setMessage(
        res.message || "Verification successful. Redirecting to login...",
      );
      router.push(`/login?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      await authApi.resendOtp({ email: formData.email });
      setMessage("OTP has been resent to your email.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains a number", met: /\d/.test(formData.password) },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.password),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">
        {/* Left Side - Video Background */}
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
              src="/car video/From KlickPin CF Revolutionizing the Road Tesla Cybertruck Unveiled.mp4"
              type="video/mp4"
            />
          </video>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Right Side - Form */}
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
                {showOtpForm ? "Verify your email" : "Create your account"}
              </h1>
              <p className="mt-2 text-[#747474]">
                {showOtpForm
                  ? "Enter the OTP sent to your email"
                  : "Start your eco-friendly journey today"}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
                  message.includes("successful") || message.includes("resent")
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            {showOtpForm ? (
              /* OTP Verification Form */
              <div className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-[#242424]">
                    OTP Code
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E5E5] py-3 px-4 text-center text-lg font-semibold tracking-widest text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || !otp}
                  className="h-12 w-full bg-[#1572D3] text-white hover:bg-[#1260B0] disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    className="text-sm font-medium text-[#1572D3] hover:text-[#1260B0] disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtpForm(false)}
                    className="text-sm font-medium text-[#747474] hover:text-[#242424]"
                  >
                    Back to registration
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Social Login */}
                <div className="mt-8 grid gap-3">
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E5E5E5] bg-white text-sm font-medium text-[#242424] transition-colors hover:bg-[#F8FAFC]"
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
                    Continue with Google
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-sm font-medium text-[#242424]">
                      Full name
                    </label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747474]" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-4 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-[#242424]">
                      Email address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747474]" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-4 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-[#242424]">
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747474]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-[#E5E5E5] py-3 pl-10 pr-12 text-sm text-[#242424] outline-none transition-colors placeholder:text-[#B6B6B6] focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/20"
                        placeholder="Create a password"
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
                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mt-2 space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-xs ${
                              req.met ? "text-green-600" : "text-[#747474]"
                            }`}
                          >
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${
                                req.met ? "bg-green-600" : "bg-[#B6B6B6]"
                              }`}
                            />
                            {req.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-[#E5E5E5] text-[#1572D3] focus:ring-[#1572D3]"
                      required
                    />
                    <label
                      htmlFor="agreeTerms"
                      className="text-sm text-[#747474]"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-[#1572D3] hover:text-[#1260B0]"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-[#1572D3] hover:text-[#1260B0]"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full bg-[#1572D3] text-white hover:bg-[#1260B0] disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </form>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-[#747474]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#1572D3] hover:text-[#1260B0]"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
