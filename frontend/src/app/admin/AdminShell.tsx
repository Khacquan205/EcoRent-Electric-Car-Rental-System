"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/owners", label: "Owners" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="rounded-2xl border bg-white/90 p-4 shadow-sm backdrop-blur">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                <Image src="/Vector.png" alt="EcoRent" fill className="object-contain p-2" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">EcoRent Admin</p>
                <p className="truncate text-xs text-slate-500">Management Console</p>
              </div>
            </Link>

            <div className="mt-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-3 py-3 text-white">
              <p className="text-xs opacity-90">Role</p>
              <p className="text-sm font-semibold">ADMIN</p>
            </div>

            <nav className="mt-4 grid gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname ? isActive(pathname, item.href) : false;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100"
                        : "rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-900">Tip</p>
              <p className="mt-1 text-xs text-slate-600">Bạn đang đăng nhập admin. Hãy kiểm tra cookie/session nếu API trả về 401.</p>
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border bg-white p-6 shadow-sm">{children}</section>
        </div>
      </div>
    </div>
  );
}
