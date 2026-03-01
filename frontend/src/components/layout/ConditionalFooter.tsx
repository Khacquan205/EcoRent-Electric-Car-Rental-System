"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const AUTH_ROUTES = ["/login", "/register"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Footer />;
}
