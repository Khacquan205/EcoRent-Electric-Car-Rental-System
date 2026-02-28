import { apiFetch } from "./client";

export interface OwnerPackage {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  maxPosts: number;
  priorityLevel: number;
  status: number;
}

export async function getActivePackages(): Promise<OwnerPackage[]> {
  const result = await apiFetch<OwnerPackage[] | { items?: OwnerPackage[] }>(
    "/api/Package/get-active-packages",
    { method: "GET" }
  );
  if (Array.isArray(result)) return result;
  return (result as { items?: OwnerPackage[] }).items ?? [];
}

export async function getPackageById(id: number): Promise<OwnerPackage> {
  return apiFetch<OwnerPackage>(`/api/Package/get-package/${id}`, { method: "GET" });
}
