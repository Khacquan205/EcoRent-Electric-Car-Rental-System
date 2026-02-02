const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";

function buildBackendUrl(pathname: string, search: string) {
  // Incoming: /api/<...>
  // Backend:  http://localhost:8080/api/<...>
  return `${BACKEND_BASE_URL}${pathname}${search}`;
}

async function proxy(request: Request) {
  const url = new URL(request.url);
  const target = buildBackendUrl(url.pathname, url.search);

  const headers = new Headers(request.headers);
  // Ensure host-related headers don't confuse the backend
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  };

  const res = await fetch(target, init);

  const responseHeaders = new Headers(res.headers);
  // Avoid leaking backend-specific encoding headers that can cause issues in proxies
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS, proxy as HEAD };
