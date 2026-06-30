import { Heart } from "lucide-react";
import Link from "next/link";
import Container from "../Container";
import DeliveryModal from "../DeliveryModal";
import AuthButton from "./AuthButton";
import CartIcon from "./CartIcon";
import HeaderSearchInput from "./HeaderSearchInput";
import Logo from "./Logo";

export default function Header({ className }: { className?: string }) {
  return (
    <header className={`${className ?? "hidden lg:block"} h-16 bg-green-50 sticky top-0 z-50`}>
      <Container className="h-full flex items-center gap-2 lg:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 md:w-40 lg:w-56">
          <Logo />
          <span
            className="text-2xl lg:text-3xl leading-none"
            style={{ fontFamily: "var(--font-lobster), cursive", color: "#2A9540" }}
          >
            Алоэ
          </span>
        </Link>

        <HeaderSearchInput className="hidden md:flex" />

        <div className="hidden md:flex items-center gap-2 text-gray-600">
          <DeliveryModal />
          <Link href="/favorites" className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Избранное">
            <Heart className="size-5" />
          </Link>
          <CartIcon />
          <AuthButton />
        </div>
      </Container>
    </header>
  );
}
