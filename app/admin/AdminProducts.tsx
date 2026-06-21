"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types";
import { deleteProduct, uploadProductImage, upsertProduct, type ProductInput } from "./actions";

const LABELS = [
  { value: "", label: "Нет" },
  { value: "popular", label: "Хит" },
  { value: "new", label: "Новинка" },
  { value: "sale", label: "Акция" },
  { value: "discount", label: "Скидка" },
];

const empty: ProductInput = {
  name: "",
  price: 0,
  old_price: null,
  image_url: "",
  product_url: "",
  category: "",
  category_id: "",
  label: null,
  description: null,
  external_id: "",
  manufacturer: null,
  seo_text: null,
};

const PAGE_SIZE = 20;

export default function AdminProducts({ products: initial }: { products: Product[] }) {
  const [page, setPageState] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Math.max(1, Number(new URLSearchParams(window.location.search).get("page")) || 1);
  });

  function setPage(next: number | ((p: number) => number)) {
    const resolved = typeof next === "function" ? next(page) : next;
    setPageState(resolved);
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(resolved));
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"id-desc" | "name-asc" | "price-asc" | "price-desc">("id-desc");
  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = Array.from(new Map(products.map((p) => [p.category_id, p.category])).entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const q = query.trim().toLowerCase();
  const filtered = products
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    .filter((p) => {
      if (labelFilter === null) return true;
      if (labelFilter === "") return !p.label;
      return p.label === labelFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, "ru");
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return b.id - a.id;
    });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openNew() {
    setEditing({ ...empty });
    setError("");
  }

  function openEdit(p: Product) {
    setEditing({
      id: p.id,
      name: p.name,
      price: p.price,
      old_price: p.old_price ?? null,
      image_url: p.image_url,
      product_url: p.product_url,
      category: p.category,
      category_id: p.category_id,
      label: p.label ?? null,
      description: p.description ?? null,
      external_id: p.external_id,
      manufacturer: p.manufacturer ?? null,
      seo_text: p.seo_text ?? null,
    });
    setError("");
  }

  function close() {
    setEditing(null);
    setError("");
  }

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    set("image_url", result.url);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleImageFile(file);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const result = await upsertProduct(editing);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editing.id) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...(editing as Product) } : p)));
    } else {
      setProducts((prev) => [{ ...editing, id: result.id } as Product, ...prev]);
    }
    close();
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить товар?")) return;
    const result = await deleteProduct(id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {q ? `Найдено: ${filtered.length} из ${products.length}` : `Товаров: ${products.length}`}
        </p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Добавить товар
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Поиск по названию или категории..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1 flex-1">
          {[
            { value: null, label: "Все" },
            { value: "popular", label: "Хит" },
            { value: "new", label: "Новинка" },
            { value: "sale", label: "Акция" },
            { value: "discount", label: "Скидка" },
            { value: "", label: "Без метки" },
          ].map((l) => (
            <button
              key={String(l.value)}
              onClick={() => { setLabelFilter(l.value); setPage(1); }}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors hover:cursor-pointer ${
                labelFilter === l.value
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 hover:cursor-pointer"
        >
          <option value="id-desc">Новые первые</option>
          <option value="name-asc">По алфавиту</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {paginated.length === 0 && (
          <p className="text-sm text-gray-400 py-6 text-center">
            {q ? `Ничего не найдено по запросу «${query}»` : "Товаров пока нет"}
          </p>
        )}
        {paginated.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
            <div className="relative w-12 h-12 shrink-0 bg-gray-100 rounded overflow-hidden">
              {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" unoptimized />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-gray-400">
                {p.category} · {p.price} сом{p.old_price ? ` (было ${p.old_price})` : ""}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => openEdit(p)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 hover:cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 hover:cursor-pointer"
          >
            ←
          </button>
          {getPageWindows(page, totalPages).map((p, i) =>
            p === null ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400 select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:cursor-pointer ${
                  p === page ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 hover:cursor-pointer"
          >
            →
          </button>
        </div>
      )}

      {/* Edit / Add drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editing.id ? "Редактировать товар" : "Добавить товар"}</h2>
              <button onClick={close} className="hover:cursor-pointer text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Изображение</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                {editing.image_url ? (
                  <div
                    className="relative w-full aspect-square max-w-[200px] bg-gray-100 rounded-xl overflow-hidden group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                  >
                    <Image src={editing.image_url} alt="" fill className="object-contain p-3" unoptimized />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow hover:cursor-pointer"
                      >
                        {uploading ? "Загрузка..." : "Заменить"}
                      </button>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className="w-full aspect-video max-h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors hover:cursor-pointer select-none"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <span className="text-sm text-green-600">Загрузка...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8" />
                        <span className="text-sm font-medium">Нажмите или перетащите</span>
                        <span className="text-xs">PNG, JPG, WebP</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Field label="Название *">
                <input
                  value={editing.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inp}
                  placeholder="Например: Масло оливковое Extra Virgin"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Цена *">
                  <input
                    type="number"
                    value={editing.price || ""}
                    onChange={(e) => set("price", Number(e.target.value))}
                    className={inp}
                    placeholder="0"
                    min={0}
                  />
                </Field>
                <Field label="Старая цена">
                  <input
                    type="number"
                    value={editing.old_price ?? ""}
                    onChange={(e) => set("old_price", e.target.value ? Number(e.target.value) : null)}
                    className={inp}
                    placeholder="0"
                    min={0}
                  />
                </Field>
              </div>

              <Field label="Категория *">
                <select
                  value={editing.category_id}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    if (cat) {
                      set("category_id", cat.id);
                      set("category", cat.name);
                    }
                  }}
                  className={inp}
                >
                  <option value="" disabled>
                    Выберите категорию
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Метка">
                <select
                  value={editing.label ?? ""}
                  onChange={(e) => set("label", (e.target.value as ProductInput["label"]) || null)}
                  className={inp}
                >
                  {LABELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Описание (Markdown)">
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => set("description", e.target.value || null)}
                  className={`${inp} min-h-35 resize-y font-mono text-xs`}
                  placeholder={"## Заголовок\n\nОписание товара..."}
                />
              </Field>

              <Field label="Производитель">
                <input
                  value={editing.manufacturer ?? ""}
                  onChange={(e) => set("manufacturer", e.target.value || null)}
                  className={inp}
                  placeholder="Например: Samsung, Apple..."
                />
              </Field>

              <Field label="SEO текст (keywords / title / description)">
                <textarea
                  value={editing.seo_text ?? ""}
                  onChange={(e) => set("seo_text", e.target.value || null)}
                  className={`${inp} min-h-24 resize-y text-xs`}
                  placeholder="Текст для мета-тегов keywords, title и description"
                />
              </Field>

              <Field label="Ссылка на товар">
                <input
                  value={editing.product_url ?? ""}
                  onChange={(e) => set("product_url", e.target.value)}
                  className={inp}
                  placeholder="https://..."
                />
              </Field>

              <Field label="External ID">
                <input
                  value={editing.external_id ?? ""}
                  onChange={(e) => set("external_id", e.target.value)}
                  className={inp}
                  placeholder="опционально"
                />
              </Field>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={save}
                disabled={saving || uploading || !editing.name || !editing.price}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors hover:cursor-pointer"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inp =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

function getPageWindows(current: number, total: number): (number | null)[] {
  if (total <= 1) return [];
  const delta = 3;
  const lo = Math.max(2, current - delta);
  const hi = Math.min(total - 1, current + delta);
  const items: (number | null)[] = [1];
  if (lo > 3) items.push(null);
  else if (lo === 3) items.push(2);
  for (let p = lo; p <= hi; p++) items.push(p);
  if (hi < total - 2) items.push(null);
  else if (hi === total - 2) items.push(total - 1);
  items.push(total);
  return items;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
