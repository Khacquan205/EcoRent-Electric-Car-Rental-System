// Default 5084 = dotnet run. For Docker (port 8080) set .env: BACKEND_BASE_URL=http://localhost:8080
const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://localhost:5084";

function buildBackendUrl(pathname: string, search: string) {
  return `${BACKEND_BASE_URL}${pathname}${search}`;
}

async function proxy(request: Request) {
  const url = new URL(request.url);
  const target = buildBackendUrl(url.pathname, url.search);

  const headers = new Headers(request.headers);
  headers.delete("host");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  };

  if (hasBody) {
    init.duplex = "half";
  }

  let res: Response;
  try {
    res = await fetch(target, init);
  } catch (err) {
    const message =
      (err as NodeJS.ErrnoException)?.code === "ECONNREFUSED"
        ? "Backend is not running. Start it with: cd backend/RentalCar && dotnet run"
        : "Failed to reach backend API";
    return new Response(JSON.stringify({ success: false, message }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
  proxy as HEAD,
};
