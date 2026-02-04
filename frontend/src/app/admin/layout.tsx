import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";

async function readSessionFromCookie(): Promise<{ role?: string; roleId?: number } | null> {
  const store = await cookies();
  const raw = store.get("ecorent_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as { role?: string; roleId?: number };
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSessionFromCookie();
  const role = (session?.role ?? "").toLowerCase();
  const isAdmin = role === "admin" || session?.roleId === 4;

  if (!session) {
    redirect("/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}
