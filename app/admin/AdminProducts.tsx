"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import type { Product } from "@/types";
import { deleteProduct, getBrands, uploadProductImage, upsertProduct, type ProductInput } from "./actions";

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
  category_id: 0,
  label: null,
  description: null,
  external_id: "",
  brand_id: null,
  seo_text: null,
  published: true,
};

type SortBy = "id-desc" | "name-asc" | "price-asc" | "price-desc";

type Props = {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
  q: string;
  label: string;
  published: string;
  sort: SortBy;
  categories: { id: number; name: string }[];
};

export default function AdminProducts({ products, page, totalPages, total, q, label, published, sort, categories }: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const brandsLoadedRef = useRef(false);

  function navigate(updates: { q?: string; label?: string; published?: string; sort?: string; page?: number }) {
    const params = new URLSearchParams(window.location.search);
    if ("q" in updates) {
      if (updates.q) params.set("q", updates.q!);
      else params.delete("q");
      params.delete("page");
    }
    if ("label" in updates) {
      if (updates.label) params.set("label", updates.label!);
      else params.delete("label");
      params.delete("page");
    }
    if ("published" in updates) {
      if (updates.published) params.set("published", updates.published!);
      else params.delete("published");
      params.delete("page");
    }
    if ("sort" in updates) {
      if (updates.sort && updates.sort !== "id-desc") params.set("sort", updates.sort!);
      else params.delete("sort");
      params.delete("page");
    }
    if ("page" in updates) {
      if (updates.page && updates.page > 1) params.set("page", String(updates.page));
      else params.delete("page");
    }
    router.replace(`?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ q: value }), 400);
  }

  async function loadBrands() {
    if (brandsLoadedRef.current) return;
    brandsLoadedRef.current = true;
    const result = await getBrands();
    if (result.ok) setBrands(result.data);
  }

  function openNew() {
    setEditing({ ...empty });
    setError("");
    loadBrands();
  }

  function openEdit(p: Product) {
    loadBrands();
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
      brand_id: p.brand_id ?? null,
      seo_text: p.seo_text ?? null,
      published: p.published,
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
    close();
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить товар?")) return;
    const result = await deleteProduct(id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Товаров: {total}</p>
        <Button variant="primary" onClick={openNew} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Добавить товар
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск по названию или категории..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {searchInput && (
          <Button
            onClick={() => {
              setSearchInput("");
              navigate({ q: "" });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1 flex-1">
          {[
            { value: "", label: "Все" },
            { value: "popular", label: "Хит" },
            { value: "new", label: "Новинка" },
            { value: "sale", label: "Акция" },
            { value: "discount", label: "Скидка" },
            { value: "none", label: "Без метки" },
          ].map((l) => (
            <Button
              key={l.value}
              onClick={() => navigate({ label: l.value })}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                label === l.value
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
              }`}
            >
              {l.label}
            </Button>
          ))}
          <div className="w-px h-4 bg-gray-300 self-center mx-1" />
          {[
            { value: "", label: "Все статусы" },
            { value: "yes", label: "Опубликованные" },
            { value: "no", label: "Скрытые" },
          ].map((p) => (
            <Button
              key={p.value}
              onClick={() => navigate({ published: p.value })}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                published === p.value
                  ? "bg-gray-700 text-white border-gray-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 hover:cursor-pointer"
        >
          <option value="id-desc">Сначала новые</option>
          <option value="name-asc">По алфавиту</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {products.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">Ничего не найдено</p>}
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
            <div className="relative w-12 h-12 shrink-0 bg-gray-100 rounded overflow-hidden">
              {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-contain p-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{p.name}</p>
                {!p.published && (
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    Скрыт
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {p.category} · {p.price} сом{p.old_price ? ` (было ${p.old_price})` : ""}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="icon" onClick={() => openEdit(p)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="icon" iconColor="danger" onClick={() => handleDelete(p.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => navigate({ page: p })} />

      {/* Edit / Add drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editing.id ? "Редактировать товар" : "Добавить товар"}</h2>
              <Button onClick={close} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </Button>
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
                    <Image src={editing.image_url} alt="" fill className="object-contain p-3" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow"
                      >
                        {uploading ? "Загрузка..." : "Заменить"}
                      </Button>
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

              <Field label="Производитель">
                <select
                  value={editing.brand_id ?? ""}
                  onChange={(e) => set("brand_id", e.target.value ? Number(e.target.value) : null)}
                  className={inp}
                >
                  <option value="">Не указан</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Категория *">
                  <select
                    value={editing.category_id}
                    onChange={(e) => {
                      const cat = categories.find((c) => String(c.id) === e.target.value);
                      if (cat) {
                        set("category_id", cat.id);
                        set("category", cat.name);
                      }
                    }}
                    className={inp}
                  >
                    <option value="" disabled>
                      Выберите
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
              </div>

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

              <Field label="Описание (Markdown)">
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => set("description", e.target.value || null)}
                  className={`${inp} min-h-35 resize-y font-mono text-xs`}
                  placeholder={"## Заголовок\n\nОписание товара..."}
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

              <div className="grid grid-cols-2 gap-4">
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

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editing.published ?? true}
                  onChange={(e) => set("published", e.target.checked)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-sm font-medium text-gray-700">Опубликован</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <Button
                variant="primary"
                size="lg"
                onClick={save}
                disabled={saving || uploading || !editing.name || !editing.price}
                className="w-full"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inp =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
