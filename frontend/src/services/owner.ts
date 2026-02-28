import { apiFetch } from "./client";
import { getSessionCookie } from "@/lib/authSession";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("accessToken") ?? getSessionCookie()?.accessToken ?? null;
  } catch {
    return getSessionCookie()?.accessToken ?? null;
  }
}

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

/** KYC OCR response (CCCD 2 mặt) */
export type KycOcrResponse = {
  fullName: string;
  dob: string;
  gender: string;
  cccdNumber: string;
  address?: string | null;
  errorMessage?: string | null;
};

/** Submit KYC "Trở thành chủ xe" (legal identity only; no address) */
export type SubmitKycBecomeOwnerRequest = {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  gender?: string | null;
};

export async function registerOwner(body: RegisterOwnerRequest): Promise<RegisterOwnerResponse> {
  return apiFetch<RegisterOwnerResponse>("/api/Owner/register-owner", {
    method: "POST",
    body,
  });
}

export async function verifyIdentity(): Promise<VerifyIdentityResponse> {
  return apiFetch<VerifyIdentityResponse>("/api/Owner/verify-identity", {
    method: "POST",
  });
}

export async function me(): Promise<OwnerMeResponse> {
  return apiFetch<OwnerMeResponse>("/api/Owner/me", {
    method: "GET",
  });
}

/** Gọi API OCR CCCD (mặt trước + mặt sau). Requires auth. Uses Next.js proxy /api/*. */
export async function kycOcr(frontImage: File, backImage: File): Promise<KycOcrResponse> {
  const formData = new FormData();
  formData.append("FrontImage", frontImage);
  formData.append("BackImage", backImage);
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/owner/kyc/ocr", { method: "POST", body: formData, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? data.errorMessage ?? `OCR failed: ${res.status}`);
  return {
    fullName: data.fullName ?? "",
    dob: data.dob ?? "",
    gender: data.gender ?? "",
    cccdNumber: data.cccdNumber ?? "",
    address: data.address ?? null,
    errorMessage: data.errorMessage ?? null,
  };
}

/** Submit KYC (một endpoint chung: full flow hoặc become-owner). */
export async function submitKycBecomeOwner(
  body: SubmitKycBecomeOwnerRequest
): Promise<{ message: string; role: string }> {
  return apiFetch<{ message: string; role: string }>("/api/owner/kyc/submit-kyc", {
    method: "POST",
    body: {
      idCardNumber: body.idNumber,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender ?? undefined,
    },
  });
}