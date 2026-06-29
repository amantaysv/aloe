import { Heart, Truck } from "lucide-react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import CartIcon from "./CartIcon";
import HeaderSearchInput from "./HeaderSearchInput";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="hidden lg:block h-16 bg-green-50 sticky top-0 z-50">
      <div className="container mx-auto h-full flex items-center gap-2 lg:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 lg:w-56">
          <Logo />
          <span
            className="text-2xl lg:text-3xl leading-none"
            style={{ fontFamily: "var(--font-lobster), cursive", color: "#2A9540" }}
          >
            Алоэ
          </span>
        </Link>

        <HeaderSearchInput />

        <div className="flex items-center gap-2 text-gray-600">
          <Link href="/delivery" className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Доставка">
            <Truck className="size-5" />
          </Link>
          <Link href="/favorites" className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Избранное">
            <Heart className="size-5" />
          </Link>
          <CartIcon />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
