import type { Metadata } from "next";
import { Geist, Lobster } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { AuthSync, CategoryNav, Footer, Header, MobileBottomNav, Toaster } from "@/components";
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

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const categories = await getCachedCategories();

  return (
    <html lang="ru">
      <body className={`${geist.className} ${lobster.variable} min-h-screen flex flex-col`} suppressHydrationWarning>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        <AuthSync />
        <Header className="hidden md:block" />
        <CategoryNav categories={categories} />
        {children}
        <Footer />
        <MobileBottomNav />
        <Toaster />
        {modal}
      </body>
    </html>
  );
}
