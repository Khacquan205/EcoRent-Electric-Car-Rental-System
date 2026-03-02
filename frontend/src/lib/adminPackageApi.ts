import { apiFetch } from "@/services/client";

export type AdminPackage = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
};

export type CreatePackageRequest = {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
};

export type UpdatePackageRequest = {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
};

type ApiResult<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getActivePackages(): Promise<AdminPackage[]> {
  const res = await apiFetch<ApiResult<AdminPackage[]>>("/api/admin/packages");
  return res.data;
}

export async function createPackage(body: CreatePackageRequest): Promise<void> {
  await apiFetch<ApiResult<null>>("/api/admin/packages", {
    method: "POST",
    body,
  });
}

export async function updatePackage(
  id: number,
  body: UpdatePackageRequest,
): Promise<void> {
  await apiFetch<ApiResult<null>>(`/api/admin/packages/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deletePackage(id: number): Promise<void> {
  await apiFetch<ApiResult<null>>(`/api/admin/packages/${id}`, {
    method: "DELETE",
  });
}
