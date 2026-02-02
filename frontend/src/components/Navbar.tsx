"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/become-renter", label: "Become a renter" },
  { href: "/cars", label: "Rental deals" },
  { href: "/how-it-works", label: "How it work" },
  { href: "/about-us", label: "Why choose us" },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <div className="flex items-center justify-between px-6 py-4 lg:px-12 xl:px-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="EcoRent Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-[#1572D3]">EcoRent</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#484848] transition-colors hover:text-[#1572D3]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-[#484848] hover:text-[#1572D3]"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#1572D3] text-white hover:bg-[#1260B0]">
              Sign up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-[#484848]" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-white">
            <SheetTitle className="text-left text-xl font-bold text-[#1572D3]">
              EcoRent
            </SheetTitle>
            <div className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-[#484848] transition-colors hover:text-[#1572D3]"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-border" />
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-[#1572D3] text-[#1572D3]"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full bg-[#1572D3] text-white hover:bg-[#1260B0]">
                  Sign up
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
