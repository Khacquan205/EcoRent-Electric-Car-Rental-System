import { getSessionCookie } from "@/lib/authSession";

type ApiErrorBody = unknown;

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(message: string, status: number, body: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /** Extract a human-readable error message from any backend response format. */
  get detail(): string {
    const b = this.body as Record<string, unknown> | null | undefined;
    if (!b) return this.message;

    // UserFriendlyException / GlobalExceptionMiddleware: { message: "..." }
    if (typeof b.message === "string" && b.message) return b.message;
    if (typeof b.Message === "string" && b.Message) return b.Message;

    // ProblemDetails: { title: "...", errors: { field: ["msg"] } }
    if (b.errors && typeof b.errors === "object") {
      const msgs = Object.values(b.errors as Record<string, string[]>)
        .flat()
        .filter(Boolean);
      if (msgs.length > 0) return msgs.join("; ");
    }
    if (typeof b.title === "string" && b.title) return b.title;

    // ValidationFilter: { errors: ["msg1", "msg2"] }
    if (Array.isArray(b.Errors) && b.Errors.length > 0)
      return b.Errors.join("; ");

    return this.message;
  }
}

const DEFAULT_BASE_URL = "http://localhost:5084";

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured && configured.trim().length > 0) return configured;

  // In the browser, prefer same-origin so Next.js rewrites (/api/* -> backend) can avoid CORS.
  if (typeof window !== "undefined") return "";

  // On the server (Node.js), call backend directly.
  return DEFAULT_BASE_URL;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  // Handle both application/json and application/problem+json
  if (!contentType.includes("json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch<TResponse>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<TResponse> {
  const url = `${getBaseUrl()}${path}`;

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // Attach Authorization header automatically on the client if available.
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    let token: string | null = null;

    try {
      token = window.localStorage.getItem("accessToken");
    } catch {
      // Ignore localStorage access issues.
    }

    if (!token) {
      const session = getSessionCookie();
      token = session?.accessToken ?? null;
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    const message = `Request failed: ${res.status} ${res.statusText}`;
    console.error("API Fetch Error Body:", body);
    throw new ApiError(message, res.status, body);
  }

  return body as TResponse;
}
