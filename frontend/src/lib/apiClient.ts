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
}

const DEFAULT_BASE_URL = "http://localhost:8080";

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
  if (!contentType.includes("application/json")) return null;
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

  const res = await fetch(url, {
    ...init,
    headers,
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const body = await parseJsonSafe(res);

  if (!res.ok) {
    const message = `Request failed: ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, body);
  }

  return body as TResponse;
}
