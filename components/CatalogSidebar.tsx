"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/Button";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  slug: string;
};

const specials = [
  { href: "/popular", label: "Популярные" },
  { href: "/new", label: "Новинки" },
  { href: "/sale", label: "Акции" },
  { href: "/discount", label: "Скидки" },
  { href: "/brands", label: "Бренды" },
];

export default function CatalogSidebar({ parents, subcategories }: { parents: Category[]; subcategories: Category[] }) {
  const params = useParams();
  const activeParentSlug = params?.slug as string | undefined;
  const activeSubSlug = params?.subSlug as string | undefined;
  const [openSlug, setOpenSlug] = useState<string | null>(activeParentSlug ?? null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSlug(activeParentSlug ?? null);
  }, [activeParentSlug]);

  return (
    <aside className="hidden lg:block w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-300 scrollbar-gutter-stable">
      <nav className="py-2">
        {specials.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors`}
          >
            {s.label}
          </Link>
        ))}

        <div className="border-t border-gray-300 my-2" />

        {parents.map((parent) => {
          const subs = subcategories.filter((s) => s.parent_id === parent.id);
          const isOpen = openSlug === parent.slug;

          return (
            <div key={parent.id}>
              <Button
                onClick={() => setOpenSlug(isOpen ? null : parent.slug)}
                className="w-full flex items-center justify-between gap-1 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 text-left"
              >
                <span>{parent.name}</span>
                <span className="text-green-600 text-lg leading-none">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </Button>

              {subs.length > 0 && (
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="bg-gray-50 border-t border-b border-gray-300">
                      {subs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/catalog/${parent.slug}/${sub.slug}`}
                          className={`block px-6 py-2 text-sm hover:text-green-600 transition-colors ${activeSubSlug === sub.slug ? "text-green-600" : "text-gray-600"}`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
