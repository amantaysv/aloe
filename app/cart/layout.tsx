import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина — Aloe.kg",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
