import Link from "next/link";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import AuthButton from "./AuthButton";

export default function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-green-600 font-bold text-xl">aloe</span>
          <span className="text-gray-800 font-bold text-xl">.kg</span>
        </Link>

        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4 shrink-0 text-sm text-gray-600">
          <a href="tel:+996312123456" className="hover:text-green-600">
            +996 312 12-34-56
          </a>
          <Link href="/favorites" className="text-gray-400 hover:text-red-400 transition-colors" title="Избранное">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </Link>
          <CartIcon />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
