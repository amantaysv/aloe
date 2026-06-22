"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

const specials = [
  { href: "/popular", label: "Популярные" },
  { href: "/new", label: "Новинки" },
  { href: "/sale", label: "Акции" },
  { href: "/discount", label: "Скидки" },
];

export default function CatalogSidebar({ parents, subcategories }: { parents: Category[]; subcategories: Category[] }) {
  const params = useParams();
  const activeId = params?.id as string;
  const activeParent = subcategories.find((s) => s.id === activeId)?.parent_id;
  const [openId, setOpenId] = useState<string | null>(activeParent || null);

  return (
    <aside className="w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-300 scrollbar-gutter-stable">
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
          const isOpen = openId === parent.id;

          return (
            <div key={parent.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : parent.id)}
                className="w-full flex items-center justify-between gap-1 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 text-left hover:cursor-pointer"
              >
                <span>{parent.name}</span>
                <span className="text-green-600 text-lg leading-none">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && subs.length > 0 && (
                <div className="bg-gray-50 border-t border-b border-gray-300">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/catalog/${sub.id}`}
                      className={`block px-6 py-2 text-sm hover:text-green-600 transition-colors ${activeId === sub.id ? "text-green-600" : "text-gray-600"}`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
