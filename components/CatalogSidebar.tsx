"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

export default function CatalogSidebar({ parents, subcategories }: { parents: Category[]; subcategories: Category[] }) {
  const params = useParams();
  const activeId = params?.id as string;

  const activeParent = subcategories.find((s) => s.id === activeId)?.parent_id;

  const [openId, setOpenId] = useState<string | null>(activeParent || null);

  return (
    <aside className="w-64 shrink-0">
      <div className="bg-green-600 text-white font-bold px-4 py-3 rounded-t-lg text-sm uppercase tracking-wide">Каталог товаров</div>
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        {parents.map((parent) => {
          const subs = subcategories.filter((s) => s.parent_id === parent.id);
          const isOpen = openId === parent.id;

          return (
            <div key={parent.id} className="border-b last:border-b-0">
              <button
                onClick={() => setOpenId(isOpen ? null : parent.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-gray-50 text-left"
              >
                <span>{parent.name}</span>
                <span className="text-green-600 text-lg leading-none">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && subs.length > 0 && (
                <div className="bg-gray-50 border-t">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/catalog/${sub.id}`}
                      className={`block px-6 py-2 text-sm border-b last:border-b-0 hover:text-green-600 transition-colors ${
                        activeId === sub.id ? "text-green-600 font-medium bg-green-50" : "text-gray-600"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
