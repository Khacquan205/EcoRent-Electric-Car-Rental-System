import { apiFetch } from "./client";

const BASE = "/api/admin/vehicle-category";

export interface AdminCategory {
  id: number;
  name: string;
  description?: string | null;
  status: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  status: number;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  status: number;
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  return apiFetch<AdminCategory[]>(BASE, { method: "GET" });
}

export async function createAdminCategory(
  body: CreateCategoryRequest
): Promise<AdminCategory> {
  return apiFetch<AdminCategory>(BASE, { method: "POST", body });
}

export async function updateAdminCategory(
  id: number,
  body: UpdateCategoryRequest
): Promise<AdminCategory> {
  return apiFetch<AdminCategory>(`${BASE}/${id}`, { method: "PUT", body });
}

export async function deleteAdminCategory(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`${BASE}/${id}`, { method: "DELETE" });
}
