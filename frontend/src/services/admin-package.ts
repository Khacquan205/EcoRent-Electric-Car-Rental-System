import { apiFetch } from "./client";

export interface AdminPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
}

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

type PackageListResponse = AdminPackage[] | { items?: AdminPackage[] };

export async function getActivePackages(): Promise<AdminPackage[]> {
  const result = await apiFetch<PackageListResponse>(
    "/api/Package/get-active-packages",
    {
      method: "GET",
    },
  );
  if (Array.isArray(result)) return result;
  return result.items ?? [];
}

export async function createPackage(
  body: AdminPackageRequest,
): Promise<AdminPackage> {
  return apiFetch<AdminPackage>("/api/admin/AdminPackage/create-package", {
    method: "POST",
    body,
  });
}

export async function updatePackage(
  id: number,
  body: AdminPackageUpdateRequest,
): Promise<AdminPackage> {
  return apiFetch<AdminPackage>(
    `/api/admin/AdminPackage/update-package/${id}`,
    {
      method: "PUT",
      body,
    },
  );
}

export async function deletePackage(id: number): Promise<{ message?: string }> {
  return apiFetch<{ message?: string }>(
    `/api/admin/AdminPackage/delete-package/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function getPackage(id: number): Promise<AdminPackage> {
  return apiFetch<AdminPackage>(`/api/admin/AdminPackage/get-package/${id}`, {
    method: "GET",
  });
}
