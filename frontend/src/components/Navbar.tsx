"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavUserMenu from "@/components/NavUserMenu";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthSession } from "@/components/AuthSessionProvider";

const navLinks = [
  { href: "/become-renter", label: "Become a renter" },
  { href: "/cars", label: "Rental deals" },
  { href: "/how-it-works", label: "How it work" },
  { href: "/about-us", label: "Why choose us" },
];

const Navbar = () => {
  const { session } = useAuthSession();
  const isAuthed = Boolean(session);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 lg:px-12 xl:px-20">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Logo.png" alt="EcoRent Logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-bold text-primary">EcoRent</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthed ? (
            <NavUserMenu />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-background">
            <SheetTitle className="text-left text-xl font-bold text-primary">EcoRent</SheetTitle>
            <div className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-border" />

              {isAuthed ? (
                <NavUserMenu variant="mobile" onNavigate={() => setMobileOpen(false)} />
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Sign up</Button>
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
