"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2, ImagePlus, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";
import { upsertBanner, deleteBanner, uploadBannerImage } from "./actions";

type Banner = { id: number; image_url: string; sort_order: number; active: boolean };

export default function AdminBanners({ banners: initial }: { banners: Banner[] }) {
  const [banners, setBanners] = useState(() =>
    [...initial].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const upload = await uploadBannerImage(fd);
    if (!upload.ok) { setUploading(false); setError(upload.error); return; }

    const sort_order = banners.length;
    const result = await upsertBanner({ image_url: upload.url, sort_order, active: true });
    setUploading(false);
    if (!result.ok) { setError(result.error); return; }
    setBanners((prev) => [...prev, { id: result.id, image_url: upload.url, sort_order, active: true }]);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  async function toggleActive(banner: Banner) {
    const result = await upsertBanner({ ...banner, active: !banner.active });
    if (!result.ok) { alert(result.error); return; }
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b)));
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить баннер?")) return;
    const result = await deleteBanner(id);
    if (!result.ok) { alert(result.error); return; }
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">Баннеров: {banners.length}</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        <button
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:cursor-pointer"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? "Загрузка..." : "Добавить баннер"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        onClick={() => !uploading && fileRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors hover:cursor-pointer select-none py-10 mb-5"
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        ) : (
          <>
            <ImagePlus className="w-8 h-8" />
            <span className="text-sm font-medium">Нажмите или перетащите изображение</span>
            <span className="text-xs">Рекомендуемое соотношение 3:1 (например 1200×400)</span>
          </>
        )}
      </div>

      <div className="space-y-3">
        {banners.map((b, i) => (
          <div key={b.id} className={`flex items-center gap-3 border rounded-xl p-3 ${b.active ? "border-gray-200" : "border-gray-100 bg-gray-50"}`}>
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
            <div className="relative w-40 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={b.image_url} alt={`Баннер ${i + 1}`} fill className="object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">Баннер {i + 1}</p>
              <p className="text-xs text-gray-400">{b.active ? "Активен" : "Скрыт"}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => toggleActive(b)}
                title={b.active ? "Скрыть" : "Показать"}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 hover:cursor-pointer"
              >
                {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 hover:cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
