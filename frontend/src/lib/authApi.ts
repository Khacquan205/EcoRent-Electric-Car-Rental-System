import { apiFetch } from "@/lib/apiClient";

export type RegisterRequest = {
  email: string;
  password: string;
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

export async function loginGoogle(body: LoginGoogleRequest): Promise<ApiResult<Record<string, unknown>>> {
  return apiFetch<ApiResult<Record<string, unknown>>>("/api/Auth/login-google", {
    method: "POST",
    body,
  });
}
