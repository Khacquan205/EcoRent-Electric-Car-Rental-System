import { apiFetch } from "./client";

export interface CustomerProfile {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
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
