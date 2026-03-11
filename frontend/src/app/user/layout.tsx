"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearSessionCookie, getSessionCookie } from "@/lib/authSession";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const s = getSessionCookie();
    Promise.resolve().then(() => {
      setEmail(s?.email ?? null);
      setRole(s?.role ?? null);
    });
  }, []);

  const initials = useMemo(() => {
    if (!email) return "U";
    const namePart = email.split("@")[0] ?? "U";
    const cleaned = namePart.replace(/[^a-zA-Z0-9]/g, "");
    return (cleaned.slice(0, 2) || "U").toUpperCase();
  }, [email]);

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href={isAdmin ? "/admin" : "/user"}
            className="flex items-center gap-2"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">EcoRent</p>
              <p className="text-xs text-gray-500">
                {isAdmin ? "Quản trị" : "Người dùng"}
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-emerald-700"
            >
              Trang chủ
            </Link>
            {isAdmin && (
              <Link
                href="/admin/management"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Quản lý hệ thống
              </Link>
            )}

            {!mounted || !email ? (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    aria-label="Menu người dùng"
                  >
                    {initials}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <p className="truncate px-2 py-2 text-sm font-medium text-gray-900">
                    {email}
                  </p>
                  <div className="my-2 h-px bg-gray-200" />

                  {!isAdmin && (
                    <>
                      <Link
                        href="/user/settings"
                        className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cài đặt
                      </Link>
                      <Link
                        href="/become-renter"
                        className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Trở thành người thuê
                      </Link>
                      <Link
                        href="/owner"
                        className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Chủ xe
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin/management"
                      className="block rounded-md px-2 py-2 text-sm text-emerald-700 hover:bg-gray-50"
                    >
                      Quản lý hệ thống
                    </Link>
                  )}

                  <div className="my-2 h-px bg-gray-200" />
                  <button
                    type="button"
                    onClick={() => {
                      clearSessionCookie();
                      setEmail(null);
                      router.push("/");
                      router.refresh();
                    }}
                    className="w-full rounded-md px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
