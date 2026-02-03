export type AuthSession = {
  accessToken: string;
  expiresIn: number | null;
  user: unknown | null;
  email?: string;
};

const COOKIE_NAME = "ecorent_session";

export function setSessionCookie(session: AuthSession) {
  const payload = encodeURIComponent(JSON.stringify(session));
  // 7 days
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE_NAME}=${payload}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getSessionCookie(): AuthSession | null {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const entry = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  const raw = entry.slice(`${COOKIE_NAME}=`.length);
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthSession;
  } catch {
    return null;
  }
}
