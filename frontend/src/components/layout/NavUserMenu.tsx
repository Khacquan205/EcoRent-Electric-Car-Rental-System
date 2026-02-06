"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/providers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function NavUserMenu({ variant = "desktop", onNavigate }: Props) {
  const router = useRouter();
  const { session, logout: logoutSession } = useAuthSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const email = session?.email ?? null;

  const initials = useMemo(() => {
    if (!email) return "U";
    const namePart = email.split("@")[0] ?? "U";
    const cleaned = namePart.replace(/[^a-zA-Z0-9]/g, "");
    return (cleaned.slice(0, 2) || "U").toUpperCase();
  }, [email]);

  function logout() {
    logoutSession();
    onNavigate?.();
    router.push("/");
  }

  if (!mounted || !email) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <div className="grid gap-2">
        <p className="truncate px-2 py-1 text-sm font-medium text-foreground">{email}</p>
        <div className="h-px bg-border" />
        <Link
          href="/user"
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          User Home
        </Link>
        <Link
          href="/user/settings"
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Settings
        </Link>
        <Link
          href="/become-renter"
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Become a renter
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent"
          aria-label="User menu"
        >
          {initials}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="truncate px-2 py-2 text-sm font-medium text-foreground">{email}</p>
        <div className="my-2 h-px bg-border" />
        <Link
          href="/user"
          className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          User Home
        </Link>
        <Link
          href="/user/settings"
          className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Settings
        </Link>
        <Link
          href="/become-renter"
          className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Become a renter
        </Link>
        <div className="my-2 h-px bg-border" />
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-md px-2 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
        >
          Logout
        </button>
      </PopoverContent>
    </Popover>
  );
}
