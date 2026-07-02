"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Pagination } from "@/components";
import type { Product } from "@/types";
import { deleteProduct, getBrands, uploadProductImage, upsertProduct, type ProductInput } from "./actions";
import ProductEditDrawer from "./ProductEditDrawer";
import ProductFilterBar from "./ProductFilterBar";
import ProductList from "./ProductList";
import ProductSearchBar from "./ProductSearchBar";
import { useAdminListNav, useDebouncedSearch } from "./useAdminListNav";

const empty: ProductInput = {
  name: "",
  price: 0,
  old_price: null,
  image_url: "",
  category: "",
  category_id: 0,
  label: null,
  description: null,
  brand_id: null,
  seo_text: null,
  published: true,
};

export type SortBy = "id-desc" | "name-asc" | "price-asc" | "price-desc" | "purchase-count-desc";

type Props = {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
  q: string;
  label: string;
  published: string;
  sort: SortBy;
  categories: { id: number; name: string; path: string }[];
};

export default function AdminProducts({
  products,
  page,
  totalPages,
  total,
  q,
  label,
  published,
  sort,
  categories,
}: Props) {
  const router = useRouter();
  const navigate = useAdminListNav({ sort: "id-desc" });
  const search = useDebouncedSearch(q, (value) => navigate({ q: value }));

  const [editing, setEditing] = useState<ProductInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const brandsLoadedRef = useRef(false);

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
      category: p.category,
      category_id: p.category_id,
      label: p.label ?? null,
      description: p.description ?? null,
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
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Товаров: {total}</p>
        <Button variant="primary" onClick={openNew} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          Добавить товар
        </Button>
      </div>

      <ProductSearchBar value={search.value} onChange={search.onChange} onClear={search.clear} />

      <ProductFilterBar
        label={label}
        published={published}
        sort={sort}
        onLabelChange={(value) => navigate({ label: value })}
        onPublishedChange={(value) => navigate({ published: value })}
        onSortChange={(value) => navigate({ sort: value })}
      />

      <ProductList products={products} onEdit={openEdit} onDelete={handleDelete} />

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => navigate({ page: p })} />

      {editing && (
        <ProductEditDrawer
          editing={editing}
          brands={brands}
          categories={categories}
          saving={saving}
          uploading={uploading}
          error={error}
          onClose={close}
          onChange={set}
          onFileSelect={handleImageFile}
          onSave={save}
        />
      )}
    </>
  );
}
