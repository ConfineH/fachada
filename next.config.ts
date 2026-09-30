import type { NextConfig } from "next";

import { DEFAULT_SITE_URL, LEGACY_VERCEL_HOST } from "./src/lib/site-url";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: LEGACY_VERCEL_HOST }],
        destination: `${DEFAULT_SITE_URL}/:path*`,
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
    ],
  },
};

export default nextConfig;
