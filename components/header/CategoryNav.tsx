"use client";

import { Baby, FlaskConical, Percent, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
};

const specials = [
  { href: "/popular", label: "Популярное", icon: Star },
  { href: "/new", label: "Новинки", icon: Plus },
  { href: "/sale", label: "Акции", icon: Percent },
];

function NavItem({
  href,
  label,
  active,
  Icon,
}: {
  href: string;
  label: string;
  active?: boolean;
  Icon?: React.ElementType;
}) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1.5 rounded-lg transition-colors shrink-0 w-18`}>
      <div
        className={`w-11 h-11 rounded-full ${active ? "bg-gray-700 text-green-600" : "bg-gray-100"} transition-colors flex items-center justify-center`}
      >
        {Icon ? <Icon /> : <div className="w-5 h-5 rounded bg-gray-300" />}
      </div>
      <span className="text-[11px] text-gray-700 text-center leading-tight line-clamp-2">{label}</span>
    </Link>
  );
}

const ICONS = {
  bytovaya: FlaskConical,
  deti: Baby,
};

export default function CategoryNav({ categories }: { categories: Category[] }) {
  const params = useParams();
  const activeParentSlug = params?.slug as string | undefined;

  const parents = categories.filter((c) => !c.parent_id);

  return (
    <nav className="hidden lg:block bg-white sticky top-16 z-40">
      <div className="container mx-auto">
        <div className="flex items-start gap-3 overflow-x-auto scrollbar-none pt-4 pb-2">
          {specials.map((s) => (
            <NavItem key={s.href} href={s.href} label={s.label} Icon={s.icon} />
          ))}
          {parents.map((category) => (
            <NavItem
              key={category.id}
              href={`/catalog/${category.slug}`}
              label={category.name}
              active={activeParentSlug === category.slug}
              Icon={ICONS[category.slug]}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
