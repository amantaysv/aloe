"use client";

import { useState } from "react";
import AdminBanners from "./AdminBanners";

type Banner = { id: number; image_url: string; sort_order: number; active: boolean; link?: string | null };

export default function AdminBannersTabbed({
  desktopBanners,
  mobileBanners,
}: {
  desktopBanners: Banner[];
  mobileBanners: Banner[];
}) {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");

  return (
    <div>
      <div className="flex gap-0 mb-5 border-b border-gray-200">
        <button
          onClick={() => setTab("desktop")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "desktop"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Десктоп
        </button>
        <button
          onClick={() => setTab("mobile")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "mobile"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Мобильные
        </button>
      </div>
      {tab === "desktop" ? (
        <AdminBanners key="desktop" banners={desktopBanners} type="desktop" />
      ) : (
        <AdminBanners key="mobile" banners={mobileBanners} type="mobile" />
      )}
    </div>
  );
}
