import { apiFetch } from "@/lib/apiClient";

export type RegisterOwnerRequest = {
  name: string;
  phone: string;
};

export type ApiResult<T> = {
  success: boolean;
  message: string;
} & T;

export type RegisterOwnerResponse = ApiResult<Record<string, unknown>>;
export type VerifyIdentityResponse = ApiResult<Record<string, unknown>>;
export type OwnerMeResponse = ApiResult<Record<string, unknown>>;

export async function registerOwner(body: RegisterOwnerRequest): Promise<RegisterOwnerResponse> {
  return apiFetch<RegisterOwnerResponse>("/api/Owner/register-owner", {
    method: "POST",
    body,
  });
}

export async function verifyIdentity(): Promise<VerifyIdentityResponse> {
  // Swagger shows {} body; send no body.
  return apiFetch<VerifyIdentityResponse>("/api/Owner/verify-identity", {
    method: "POST",
  });
}

export async function me(): Promise<OwnerMeResponse> {
  return apiFetch<OwnerMeResponse>("/api/Owner/me", {
    method: "GET",
  });
}
