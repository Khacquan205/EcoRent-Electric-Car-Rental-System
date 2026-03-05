import { apiFetch } from "./client";

export interface AdminUser {
  id: number;
  email: string;
  roleId: number;
  roleName?: string | null;
  status: number;
  createdAt: string;
}

export interface PromoteToStaffRequest {
  userId: number;
  name: string;
  phone?: string;
  staffCode?: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/accounts/users", { method: "GET" });
}

export async function promoteToStaff(
  body: PromoteToStaffRequest,
): Promise<{ message?: string }> {
  return apiFetch<{ message?: string }>("/api/admin/accounts/staff/promote", {
    method: "POST",
    body,
  });
}
