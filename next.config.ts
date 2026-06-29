import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 2678400,
    qualities: [75],
    remotePatterns: [
      { protocol: "https", hostname: "aloe.kg" },
      { protocol: "https", hostname: "dnlburbuchxzxdmhuczu.supabase.co" },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
