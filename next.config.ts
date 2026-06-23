import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "aloe.kg" },
      { protocol: "https", hostname: "dnlburbuchxzxdmhuczu.supabase.co" },
    ],
  },
};

export default nextConfig;
