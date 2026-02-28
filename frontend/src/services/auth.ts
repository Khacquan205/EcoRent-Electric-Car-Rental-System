import { apiFetch } from "./client";

export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
};

export type VerifyRegistrationRequest = {
  email: string;
  code: string;
};

export type ResendOtpRequest = {
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type LoginGoogleRequest = {
  idToken: string;
};

export type ApiResult<T> = {
  success: boolean;
  message: string;
} & T;

export type LoginResponse = ApiResult<{
  accessToken: string | null;
  expiresIn: number | null;
  user: unknown | null;
}>;

/** Normalize auth response from backend (handles both camelCase and PascalCase). */
export function normalizeAuthResponse(res: Record<string, unknown>): {
  success: boolean;
  message: string;
  accessToken: string | null;
  expiresIn: number | null;
  user: unknown | null;
} {
  const r = res as Record<string, unknown>;
  return {
    success: (r.success as boolean) ?? (r.Success as boolean) ?? false,
    message: String(r.message ?? r.Message ?? ""),
    accessToken: (r.accessToken as string | null) ?? (r.AccessToken as string | null) ?? null,
    expiresIn: (r.expiresIn as number | null) ?? (r.ExpiresIn as number | null) ?? null,
    user: (r.user as unknown) ?? (r.User as unknown) ?? null,
  };
}

export type RegisterResponse = ApiResult<Record<string, unknown>>;

export async function register(body: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/api/Auth/register", {
    method: "POST",
    body,
  });
}

export async function verifyRegistration(body: VerifyRegistrationRequest): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch<ApiResult<Record<string, unknown>>>("/api/Auth/verify-registration", {
    method: "POST",
    body,
  });
}

export async function resendOtp(body: ResendOtpRequest): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch<ApiResult<Record<string, unknown>>>("/api/Auth/resend-otp", {
    method: "POST",
    body,
  });
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/Auth/login", {
    method: "POST",
    body,
  });
}

export async function changePassword(body: ChangePasswordRequest): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch<ApiResult<Record<string, unknown>>>("/api/Auth/change-password", {
    method: "POST",
    body,
  });
}

export async function loginGoogle(body: LoginGoogleRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/Auth/login-google", {
    method: "POST",
    body,
  });
}
