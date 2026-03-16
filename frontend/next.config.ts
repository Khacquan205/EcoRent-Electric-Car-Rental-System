import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },

  async rewrites() {
    const backend = process.env.BACKEND_BASE_URL ?? "http://localhost:8080";
    return [
      { source: "/hubs/:path*", destination: `${backend}/hubs/:path*` },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
