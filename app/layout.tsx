import type { Metadata } from "next";
import { Geist, Lobster } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import AuthSync from "@/components/AuthSync";
import CatalogSidebar from "@/components/CatalogSidebar";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileMenu from "@/components/MobileMenu";
import Toaster from "@/components/Toaster";
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
  const parents = categories.filter((c) => !c.parent_id);
  const subs = categories.filter((c) => c.parent_id);

  return (
    <html lang="ru">
      <body className={`${geist.className} ${lobster.variable}`} suppressHydrationWarning>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        <AuthSync />
        <Header />
        <MobileMenu parents={parents} subcategories={subs} />
        <div className="max-w-7xl mx-auto flex">
          <CatalogSidebar parents={parents} subcategories={subs} />
          <div className="flex-1 min-w-0 px-3 lg:px-6 py-4 lg:py-8 pb-20 lg:pb-8">{children}</div>
        </div>
        <MobileBottomNav />
        <Toaster />
      </body>
    </html>
  );
}
