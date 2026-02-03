import { apiFetch } from "@/lib/apiClient";

export type AdminPackageRequest = {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
};

export type AdminPackageUpdateRequest = AdminPackageRequest & {
  status: number;
};

export async function createPackage(body: AdminPackageRequest): Promise<unknown> {
  return apiFetch<unknown>("/api/admin/AdminPackage/create-package", {
    method: "POST",
    body,
  });
}

export async function updatePackage(id: number, body: AdminPackageUpdateRequest): Promise<unknown> {
  return apiFetch<unknown>(`/api/admin/AdminPackage/update-package/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deletePackage(id: number): Promise<unknown> {
  return apiFetch<unknown>(`/api/admin/AdminPackage/delete-package/${id}`, {
    method: "DELETE",
  });
}

export async function getPackage(id: number): Promise<unknown> {
  return apiFetch<unknown>(`/api/admin/AdminPackage/get-package/${id}`, {
    method: "GET",
  });
}
