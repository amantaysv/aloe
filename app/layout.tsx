import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import CatalogSidebar from "@/components/CatalogSidebar";
import Header from "@/components/Header";
import Toaster from "@/components/Toaster";
import NextTopLoader from "nextjs-toploader";

const geist = Geist({ subsets: ["latin"] });

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
  console.log("categories count:", categories.length);
  console.log(
    "parents:",
    categories.filter((c) => !c.parent_id),
  );
  return (
    <html lang="ru">
      <body className={geist.className}>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
          <CatalogSidebar parents={parents} subcategories={subs} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
