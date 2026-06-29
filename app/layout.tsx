import type { Metadata } from "next";
import { Geist, Lobster } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { AuthSync, Header, MobileBottomNav, Toaster } from "@/components";
import CategoryNav from "@/components/header/CategoryNav";
import { getCachedCategories } from "@/lib/cached-queries";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const lobster = Lobster({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-lobster",
});

export const metadata: Metadata = {
  title: "Aloe.kg",
  description: "Интернет-магазин бытовой химии и косметики",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCachedCategories();

  return (
    <html lang="ru">
      <body className={`${geist.className} ${lobster.variable}`} suppressHydrationWarning>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        <AuthSync />
        <Header />
        <CategoryNav categories={categories} />
        {children}
        <MobileBottomNav />
        <Toaster />
      </body>
    </html>
  );
}
