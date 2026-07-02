import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход и регистрация — Aloe.kg",
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
