"use client";

import { Menu } from "lucide-react";
import { useMobileMenu } from "@/store/mobile-menu";
import Button from "./Button";

export default function MobileMenuButton() {
  const toggle = useMobileMenu((s) => s.toggle);
  return (
    <Button variant="icon" onClick={toggle} className="lg:hidden" aria-label="Открыть меню">
      <Menu className="size-6" />
    </Button>
  );
}
