import { apiFetch } from "./client";

export interface VehicleCategory {
  id: number;
  name: string;
  description?: string | null;
}

export async function getCategories(): Promise<VehicleCategory[]> {
  return apiFetch<VehicleCategory[]>("/api/categories", { method: "GET" });
}
