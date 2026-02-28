"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Zap, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as authApi from "@/services/auth";
import { GoogleLoginButton } from "@/components/shared";
import bgImage from "@/assets/bgLoginSignup.jpg";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    displayName: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (formData.password !== formData.confirmPassword) {
      setMessage("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        displayName: formData.displayName,
        address: formData.address,
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
    { text: "Ít nhất 8 ký tự", met: formData.password.length >= 8 },
    { text: "Có chứa số", met: /\d/.test(formData.password) },
    { text: "Có chữ hoa", met: /[A-Z]/.test(formData.password) },
  ];

  const isSuccess =
    message !== null &&
    (message.includes("successful") || message.includes("resent"));

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden px-4">

      {/* Background image — scaled to prevent blur edge artifacts */}
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

        {/* ── OTP VERIFICATION ── */}
        {showOtpForm ? (
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

            {/* Heading */}
            <div className="mt-5">
              <h1 className="text-xl font-semibold text-slate-900">
                Xác nhận email
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Chúng tôi đã gửi mã OTP đến{" "}
                <span className="font-semibold text-slate-700">
                  {formData.email}
                </span>
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mt-4 rounded-xl border px-3 py-2.5 text-xs ${
                  isSuccess
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            {/* OTP input */}
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-700">
                Mã OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 py-3 px-3 text-center text-xl font-semibold tracking-[0.5em] text-slate-900 outline-none transition-all placeholder:text-slate-200 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                placeholder="------"
                required
              />
              <p className="mt-1.5 text-center text-[11px] text-slate-400">
                Mã có hiệu lực trong 10 phút
              </p>
            </div>

            {/* Verify button */}
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isSubmitting || !otp}
              className="mt-4 h-10 w-full rounded-xl bg-[#1572D3] text-sm font-semibold text-white hover:bg-[#1260B0] disabled:opacity-50"
            >
              {isSubmitting ? "Đang xác nhận..." : "Xác nhận OTP"}
            </Button>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                className="text-sm font-medium text-[#1572D3] hover:text-[#1260B0] disabled:opacity-50"
              >
                Gửi lại OTP
              </button>
              <button
                type="button"
                onClick={() => setShowOtpForm(false)}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                Quay lại đăng ký
              </button>
            </div>
          </div>

        ) : (

          /* ── REGISTRATION FORM ── */
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

            {/* Heading */}
            <div className="mt-5">
              <h1 className="text-xl font-semibold text-slate-900">
                Tạo tài khoản
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Bắt đầu hành trình xanh cùng cộng đồng EcoRent.
              </p>
            </div>

            {/* Message banner */}
            {message && (
              <div
                className={`mt-4 rounded-xl border px-3 py-2.5 text-xs ${
                  isSuccess
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            {/* Google */}
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
                  hoặc tiếp tục với email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* Display name */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-700">
                  Tên hiển thị
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              {/* Address (for nearby car recommendation) */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-700">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                  placeholder="Quận 1, TP.HCM"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-10 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                    placeholder="Tạo mật khẩu mạnh"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-[#1572D3] focus:ring-2 focus:ring-[#1572D3]/15"
                    placeholder="Xác nhận mật khẩu"
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Mật khẩu không khớp</p>
                )}

                {/* Password requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1.5">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        {req.met ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span className={req.met ? "text-emerald-600" : "text-slate-400"}>
                          {req.text}
                        </span>
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
                  className="mt-0.5 h-4 w-4 rounded border-slate-200 text-[#1572D3] focus:ring-[#1572D3]"
                  required
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-500">
                  Tôi đồng ý với{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#1572D3] hover:text-[#1260B0]"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#1572D3] hover:text-[#1260B0]"
                  >
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || formData.password !== formData.confirmPassword}
                className="mt-1 h-10 w-full rounded-xl bg-[#1572D3] text-sm font-semibold text-white hover:bg-[#1260B0] disabled:opacity-50"
              >
                {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </form>

            {/* Sign in link */}
            <p className="mt-5 text-center text-xs text-slate-400">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1572D3] hover:text-[#1260B0]"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        )}

        {/* Brand note */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Zap className="h-3.5 w-3.5 text-[#1572D3]" />
          Nền tảng thuê xe điện P2P đầu tiên tại Việt Nam
        </p>
      </div>
    </div>
  );
}
