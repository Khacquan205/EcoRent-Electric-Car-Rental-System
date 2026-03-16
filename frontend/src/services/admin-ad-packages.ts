import { apiFetch } from "./client";

export type AdPackage = {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAdPackageRequest = {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
};

export type UpdateAdPackageRequest = CreateAdPackageRequest & {
  status: number;
};

export async function getAdminAdPackages(): Promise<AdPackage[]> {
  return apiFetch<AdPackage[]>("/api/admin/ad-packages", { method: "GET" });
}

export async function createAdPackage(
  body: CreateAdPackageRequest,
): Promise<AdPackage> {
  return apiFetch<AdPackage>("/api/admin/ad-packages", {
    method: "POST",
    body,
  });
}

export async function updateAdPackage(
  id: number,
  body: UpdateAdPackageRequest,
): Promise<AdPackage> {
  return apiFetch<AdPackage>(`/api/admin/ad-packages/${id}`, {
    method: "PUT",
    body,
  });
}

export async function deleteAdPackage(id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/ad-packages/${id}`, { method: "DELETE" });
}
