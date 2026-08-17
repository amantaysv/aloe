import type { MetadataRoute } from "next";

// Without a manifest the storefront can't be added to a mobile home screen — a real loss for a
// mobile-first audience. Icons already exist as app/icon.svg and app/apple-icon.png.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aloe.kg — бытовая химия и косметика",
    short_name: "Aloe.kg",
    description: "Интернет-магазин бытовой химии и косметики с доставкой по Бишкеку",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    lang: "ru",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
