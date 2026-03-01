import { AuthSession } from "./authSession";

export type JwtPayload = {
  sub?: string;
  email?: string;
  userId?: string;
  roleId?: string;
  roleCode?: string;
  verify_level?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
};

/**
 * Decodes a JWT token payload without verifying the signature.
 * Signature verification happens on the backend — this is for reading claims only.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token is expired or cannot be decoded.
 * Uses the `exp` claim (seconds since epoch).
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}

/**
 * Builds an AuthSession from the backend login response.
 * Role and email are sourced from the JWT claims (roleCode, email),
 * which are guaranteed to be present regardless of login method.
 */
export function buildSessionFromLoginResponse(
  accessToken: string,
  expiresIn: number | null,
  user: unknown,
): AuthSession {
  const payload = decodeJwt(accessToken);

  const roleId = payload?.roleId ? Number(payload.roleId) : undefined;
  const role = payload?.roleCode ?? undefined;
  const email = payload?.email ?? undefined;

  return {
    accessToken,
    expiresIn,
    user,
    email,
    roleId,
    role,
  };
}
