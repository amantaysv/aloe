import Link from "next/link";
import Container from "./Container";
import Logo from "./header/Logo";

const links = [
  { href: "/delivery", label: "Доставка" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
  { href: "/legal-entities", label: "Для юр лиц" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-green-50 pb-20 lg:pb-6 pt-6">
      <Container className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
        <Logo />

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-600 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="text-sm text-gray-400">© {new Date().getFullYear()} Aloe.kg</span>
      </Container>
    </footer>
  );
}
