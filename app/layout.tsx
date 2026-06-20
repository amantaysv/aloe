import type { Metadata } from "next";
import { Geist, Lobster } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import CatalogSidebar from "@/components/CatalogSidebar";
import Header from "@/components/Header";
import Toaster from "@/components/Toaster";
import { supabase } from "@/lib/supabase";
import "./globals.css";
import { LucideProvider } from "lucide-react";

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

async function getCategories() {
  const { data } = await supabase.from("categories").select("*");
  return data || [];
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  const parents = categories.filter((c) => !c.parent_id);
  const subs = categories.filter((c) => c.parent_id);

  return (
    <html lang="ru">
      <body className={`${geist.className} ${lobster.variable}`}>
        <LucideProvider className="size-5">
          <NextTopLoader color="#16a34a" showSpinner={false} />
          <Header />
          <div className="max-w-7xl mx-auto flex">
            <CatalogSidebar parents={parents} subcategories={subs} />
            <div className="flex-1 min-w-0 px-6 py-8">{children}</div>
          </div>
          <Toaster />
        </LucideProvider>
      </body>
    </html>
  );
}
