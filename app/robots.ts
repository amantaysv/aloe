import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /search and /catalog?q= are already noindex via generateMetadata, but crawlers still
      // burn budget on the unbounded ?q= / ?brand= / ?page= permutations behind them.
      disallow: ["/admin", "/cart", "/checkout", "/profile", "/favorites", "/auth", "/search", "/*?q=", "/*?brand="],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
