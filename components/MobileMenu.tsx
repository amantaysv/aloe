"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMobileMenu } from "@/store/mobile-menu";

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

export default function MobileMenu({ parents, subcategories }: { parents: Category[]; subcategories: Category[] }) {
  const { open, close } = useMobileMenu();
  const params = useParams();
  const activeParentSlug = params?.slug as string | undefined;
  const activeSubSlug = params?.subSlug as string | undefined;
  const [openSlug, setOpenSlug] = useState<string | null>(activeParentSlug ?? null);

  useEffect(() => {
    close();
  }, [params, close]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={close} aria-hidden="true" />}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 shrink-0">
          <span className="font-semibold text-gray-800 text-base">Каталог</span>
          <button
            onClick={close}
            className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="overflow-y-auto h-[calc(100%-3.5rem)] py-2">
          {specials.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={close}
              className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {s.label}
            </Link>
          ))}

          <div className="border-t border-gray-200 my-2" />

          {parents.map((parent) => {
            const subs = subcategories.filter((s) => s.parent_id === parent.id);
            const isOpen = openSlug === parent.slug;
            const isActive = activeParentSlug === parent.slug;

            return (
              <div key={parent.id}>
                <button
                  onClick={() => setOpenSlug(isOpen ? null : parent.slug)}
                  className={`w-full flex items-center justify-between gap-1 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 text-left transition-colors ${
                    isActive ? "text-green-600" : ""
                  }`}
                >
                  <span>{parent.name}</span>
                  <span className="text-green-600 shrink-0">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                {subs.length > 0 && (
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className="bg-gray-50 border-t border-b border-gray-200">
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/catalog/${parent.slug}/${sub.slug}`}
                            onClick={close}
                            className={`block px-6 py-2 text-sm hover:text-green-600 transition-colors ${
                              activeSubSlug === sub.slug ? "text-green-600" : "text-gray-600"
                            }`}
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
      </div>
    </>
  );
}
