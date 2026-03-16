"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavUserMenu from "@/components/layout/NavUserMenu";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthSession } from "@/components/providers";

const defaultNavLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/posts", label: "Xe cho thuê" },
  { href: "/become-owner", label: "Trở thành chủ xe" },
  { href: "/how-it-works", label: "Dịch vụ của chúng tôi" },
];

const ownerNavLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/posts", label: "Xe cho thuê" },
  { href: "/owner/subscription", label: "Gói của tôi" },
  { href: "/owner/owner-packages", label: "Mua gói" },
  { href: "/owner/advertisements", label: "Quảng cáo" },
  { href: "/owner/post/new", label: "Đăng xe" },
  { href: "/owner/posts", label: "Thông báo mới" },
];

const Navbar = () => {
  const { session } = useAuthSession();
  const isAuthed = Boolean(session);
  const isOwner = (session?.role ?? "").toUpperCase() === "OWNER";
  const isAdminOrStaff =
    (session?.role ?? "").toUpperCase() === "ADMIN" ||
    (session?.role ?? "").toUpperCase() === "STAFF" ||
    session?.roleId === 3 ||
    session?.roleId === 4;
  const navLinks = isOwner ? ownerNavLinks : defaultNavLinks;
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full pr-2 transition-colors duration-200 hover:text-primary"
        >
          <Image
            src="/favicon.ico"
            alt="EcoRent Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold text-primary sm:text-xl">
            EcoRent
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
                <span
                  className={`pointer-events-none absolute -bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-200 ${
                    isActive
                      ? "w-8 opacity-100"
                      : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAdminOrStaff && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary/50 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
              >
                Quản trị
              </Button>
            </Link>
          )}
          {isAuthed ? (
            <NavUserMenu />
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-primary hover:shadow-sm hover:-translate-y-px"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-lg hover:bg-primary/90">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="transition-colors duration-200 hover:bg-accent hover:text-primary"
            >
              <Menu className="h-6 w-6 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-background">
            <SheetTitle className="text-left text-xl font-bold text-primary">
              EcoRent
            </SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {isAdminOrStaff && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors duration-200 ${
                    pathname.startsWith("/admin")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Quản trị
                </Link>
              )}
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-3 h-px bg-border" />

              {isAuthed ? (
                <NavUserMenu
                  variant="mobile"
                  onNavigate={() => setMobileOpen(false)}
                />
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="mt-2 w-full transition-all duration-200 hover:-translate-y-px hover:shadow-md">
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
