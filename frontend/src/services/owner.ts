import { apiFetch } from "./client";
import { getSessionCookie } from "@/lib/authSession";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem("accessToken") ??
      getSessionCookie()?.accessToken ??
      null
    );
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

/** KYC OCR response (CCCD 2 mặt). cccdFaceId is used for liveness/selfie face verification. */
export type KycOcrResponse = {
  fullName: string;
  dob: string;
  gender: string;
  cccdNumber: string;
  cccdFaceId?: string | null;
  address?: string | null;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  errorMessage?: string | null;
};

/** Face verification result (liveness or selfie upload). */
export type KycFaceVerificationResult = {
  isLive?: boolean;
  isMatch: boolean;
  confidence: number;
  errorMessage?: string | null;
};

/** Selfie upload verification result (matchScore 0–1, isMatched, message). */
export type KycVerifyFaceUploadResult = {
  matchScore: number;
  isMatched: boolean;
  message: string | null;
};

/** Submit KYC "Trở thành chủ xe" (legal identity only; no address) */
export type SubmitKycBecomeOwnerRequest = {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  gender?: string | null;
};

export async function registerOwner(
  body: RegisterOwnerRequest,
): Promise<RegisterOwnerResponse> {
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
export async function kycOcr(
  frontImage: File,
  backImage: File,
): Promise<KycOcrResponse> {
  const formData = new FormData();
  formData.append("FrontImage", frontImage);
  formData.append("BackImage", backImage);
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/owner/kyc/ocr", {
    method: "POST",
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      data.message ?? data.errorMessage ?? `OCR failed: ${res.status}`,
    );
  return {
    fullName: data.fullName ?? "",
    dob: data.dob ?? "",
    gender: data.gender ?? "",
    cccdNumber: data.cccdNumber ?? "",
    cccdFaceId: data.cccdFaceId ?? null,
    address: data.address ?? null,
    frontImageUrl: data.frontImageUrl ?? null,
    backImageUrl: data.backImageUrl ?? null,
    errorMessage: data.errorMessage ?? null,
  };
}

/** Face verification via live camera (video). Requires OCR passed first. */
export async function kycLivenessCheck(
  video: File,
  cccdFaceId: string,
): Promise<KycFaceVerificationResult> {
  const formData = new FormData();
  formData.append("Video", video);
  formData.append("CccdFaceId", cccdFaceId);
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/owner/kyc/liveness-check", {
    method: "POST",
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message ??
        data.errorMessage ??
        `Liveness check failed: ${res.status}`,
    );
  }
  return {
    isLive: data.isLive,
    isMatch: data.isMatch ?? false,
    confidence: typeof data.confidence === "number" ? data.confidence : 0,
    errorMessage: data.errorMessage ?? null,
  };
}

/** Face verification via selfie upload (fallback when camera fails). Requires OCR passed first. */
export async function kycVerifyFaceUpload(
  selfieImage: File,
  cccdFaceId: string,
): Promise<KycVerifyFaceUploadResult> {
  const formData = new FormData();
  formData.append("SelfieImage", selfieImage);
  formData.append("CccdFaceId", cccdFaceId);
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/owner/kyc/verify-face-upload", {
    method: "POST",
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message ??
        data.errorMessage ??
        `Face verification failed: ${res.status}`,
    );
  }
  return {
    matchScore: typeof data.matchScore === "number" ? data.matchScore : 0,
    isMatched: data.isMatched ?? false,
    message: data.message ?? null,
  };
}

/** Submit KYC (một endpoint chung: full flow hoặc become-owner). */
export async function submitKycBecomeOwner(
  body: SubmitKycBecomeOwnerRequest,
): Promise<{ message: string; role: string }> {
  return apiFetch<{ message: string; role: string }>(
    "/api/owner/kyc/submit-kyc",
    {
      method: "POST",
      body: {
        idCardNumber: body.idNumber,
        fullName: body.fullName,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender ?? undefined,
      },
    },
  );
}
