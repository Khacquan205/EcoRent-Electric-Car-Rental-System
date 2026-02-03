"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as authApi from "@/lib/authApi";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onLogin() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await authApi.login({ email, password });
      if (!res.success) {
        setMessage(res.message || "Đăng nhập thất bại");
        return;
      }

      if (res.accessToken) {
        setSession({
          accessToken: res.accessToken,
          expiresIn: res.expiresIn,
          user: res.user,
          email,
        });
      } else {
        setSession(null);
      }

      router.push("/");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-background">
      <div className="container mx-auto flex px-6 py-14">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Chào mừng bạn quay lại. Vui lòng nhập thông tin để tiếp tục.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                void onLogin();
              }}
            >
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-10 w-full"
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
