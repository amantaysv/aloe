import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // formats: ["image/webp"],
    // minimumCacheTTL: 2678400,
    // qualities: [75],
    // remotePatterns: [
    //   { protocol: "https", hostname: "aloe.kg" },
    //   { protocol: "https", hostname: "dnlburbuchxzxdmhuczu.supabase.co" },
    // ],
    unoptimized: true,
  },
  devIndicators: false,
  experimental: {
    serverActions: {
      // Product photos are uploaded untouched and re-encoded in `uploadProductImage`. The default
      // is 1 MB, which silently rejected anything straight off a phone before the action ran.
      bodySizeLimit: "16mb",
    },
  },
  // lib/invoice.ts resolves these at runtime via process.cwd(), which the file tracer
  // cannot follow — without this the TTFs are missing from the serverless bundle and
  // invoice generation throws in production.
  outputFileTracingIncludes: {
    "/checkout": ["./lib/fonts/**"],
    "/admin/orders": ["./lib/fonts/**"],
  },
  poweredByHeader: false,
};

export default nextConfig;
