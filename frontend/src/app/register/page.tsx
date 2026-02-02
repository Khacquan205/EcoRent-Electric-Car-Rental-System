"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as authApi from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onRegister() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.register({ email, password });
      if (!res.success) {
        setMessage(res.message || "Đăng ký thất bại");
        return;
      }

      setMessage(res.message || "Đăng ký thành công. Vui lòng nhập OTP để xác thực.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerify() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.verifyRegistration({ email, code: otp });
      if (!res.success) {
        setMessage(res.message || "Xác thực thất bại");
        return;
      }

      setMessage(res.message || "Xác thực thành công. Đang chuyển sang trang đăng nhập...");
      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Xác thực thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResend() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      await authApi.resendOtp({ email });
      setMessage("Đã gửi lại OTP.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gửi lại OTP thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-background">
      <div className="container mx-auto flex px-6 py-14">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Đăng ký</CardTitle>
            <CardDescription>
              Tạo tài khoản để bắt đầu thuê xe điện nhanh chóng.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void onRegister();
              }}
            >
              <div className="grid gap-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Họ và tên
                </label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {message}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-1 h-10 w-full">
                {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
              </Button>

              <div className="mt-2 grid gap-3 rounded-xl border bg-card p-4">
                <p className="text-sm font-medium">Xác thực OTP</p>

                <div className="grid gap-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Mã OTP
                  </label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Nhập OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void onVerify()}
                    className="h-10"
                  >
                    Xác thực
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => void onResend()}
                    className="h-10"
                  >
                    Gửi lại OTP
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
