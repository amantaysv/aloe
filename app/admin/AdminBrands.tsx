"use client";

import { useMemo, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import Button from "@/components/Button";
import { deleteBrand, upsertBrand, type BrandInput } from "./actions";
import { adminInputCls as inp, Field } from "./admin-ui";

type Brand = { id: number; name: string; slug: string };

const empty: BrandInput = { name: "", slug: "" };

export default function AdminBrands({
  brands: initial,
  usedBrandIds: usedIds,
}: {
  brands: Brand[];
  usedBrandIds: number[];
}) {
  const [brands, setBrands] = useState(initial);
  const [editing, setEditing] = useState<(BrandInput & { isNew: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const usedBrandIds = useMemo(() => new Set(usedIds), [usedIds]);

  function openNew() {
    setEditing({ ...empty, isNew: true });
    setError("");
  }

  function openEdit(b: Brand) {
    setEditing({ id: b.id, name: b.name, slug: b.slug, isNew: false });
    setError("");
  }

  function close() {
    setEditing(null);
    setError("");
  }

  function set<K extends keyof BrandInput>(key: K, value: BrandInput[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.name.trim()) {
      setError("Slug и название обязательны");
      return;
    }
    setSaving(true);
    setError("");
    const name = editing.name.trim();
    const slug = editing.slug.trim();
    const result = await upsertBrand({ id: editing.id, name, slug });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const byName = (a: Brand, b: Brand) => a.name.localeCompare(b.name);
    setBrands((prev) => {
      const exists = prev.find((b) => b.id === editing.id);
      const next = exists
        ? prev.map((b) => (b.id === editing.id ? { ...b, name, slug } : b))
        : [...prev, { id: result.id, name, slug }];
      return next.sort(byName);
    });
    close();
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить бренд?")) return;
    const result = await deleteBrand(id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">Брендов: {brands.length}</p>
        <Button variant="primary" onClick={openNew} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" />
          Добавить бренд
        </Button>
      </div>

      <div className="space-y-1">
        {brands.map((brand) => {
          const locked = usedBrandIds.has(brand.id);
          return (
            <div key={brand.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{brand.name}</span>
                <span className="text-xs text-gray-400 ml-2">{brand.slug}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="icon" size="sm" onClick={() => openEdit(brand)} aria-label="Редактировать">
                  <PencilIcon className="size-4" />
                </Button>
                {!locked && (
                  <Button variant="icon" iconColor="danger" size="sm" onClick={() => handleDelete(brand.id)} aria-label="Удалить">
                    <Trash2Icon className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editing.isNew ? "Новый бренд" : "Редактировать бренд"}</h2>
              <Button onClick={close} aria-label="Закрыть" className="text-gray-400 hover:text-gray-700">
                <XIcon className="size-5" />
              </Button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <Field label="Slug *">
                <input
                  value={editing.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className={inp}
                  placeholder="garnier"
                />
                <p className="text-xs text-gray-400 mt-1">Используется в URL: /brands/slug</p>
              </Field>

              <Field label="Название *">
                <input
                  value={editing.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inp}
                  placeholder="Garnier"
                />
              </Field>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <Button variant="primary" size="lg" onClick={save} disabled={saving} className="w-full">
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

