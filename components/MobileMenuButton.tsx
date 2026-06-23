"use client";

import { Menu } from "lucide-react";
import { useMobileMenu } from "@/store/mobile-menu";

export default function MobileMenuButton() {
  const toggle = useMobileMenu((s) => s.toggle);
  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-600 hover:text-green-600 transition-colors lg:hidden"
      aria-label="Открыть меню"
    >
      <Menu className="size-6" />
    </button>
  );
}
