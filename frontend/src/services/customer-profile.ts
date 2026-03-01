import { apiFetch } from "./client";

export interface CustomerProfile {
  id?: number;
  userId?: number;
  displayName?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export type CustomerProfileUpdate = Partial<CustomerProfile>;

/**
 * Fetch current customer profile.
 * GET /api/customer/profile
 */
export async function getCustomerProfile(): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>("/api/customer/profile", { method: "GET" });
}

/**
 * Update customer profile.
 * PUT /api/customer/profile
 * Expects only changed, non-empty fields.
 */
export async function updateCustomerProfile(
  data: CustomerProfileUpdate
): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>("/api/customer/profile", {
    method: "PUT",
    body: data,
  });
}
