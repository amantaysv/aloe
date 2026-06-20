"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronRight } from "lucide-react";
import { upsertCategory, deleteCategory, type CategoryInput } from "./actions";
import type { Product } from "@/types";

type Category = { id: string; name: string; parent_id: string | null };

const empty: CategoryInput = { id: "", name: "", parent_id: null };

export default function AdminCategories({
  categories: initial,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<(CategoryInput & { isNew: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parents = categories.filter((c) => !c.parent_id);
  const subs = categories.filter((c) => c.parent_id);
  const usedCategoryIds = new Set(products.map((p) => p.category_id));

  function openNew(parentId: string | null = null) {
    setEditing({ ...empty, parent_id: parentId, isNew: true });
    setError("");
  }

  function openEdit(c: Category) {
    setEditing({ id: c.id, name: c.name, parent_id: c.parent_id, isNew: false });
    setError("");
  }

  function close() {
    setEditing(null);
    setError("");
  }

  function set<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!editing) return;
    if (!editing.id.trim() || !editing.name.trim()) {
      setError("ID и название обязательны");
      return;
    }
    setSaving(true);
    setError("");
    const result = await upsertCategory({ id: editing.id.trim(), name: editing.name.trim(), parent_id: editing.parent_id });
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }

    setCategories((prev) => {
      const exists = prev.find((c) => c.id === editing.id);
      if (exists) return prev.map((c) => c.id === editing.id ? { ...c, name: editing.name, parent_id: editing.parent_id } : c);
      return [...prev, { id: editing.id.trim(), name: editing.name.trim(), parent_id: editing.parent_id }];
    });
    close();
  }

  async function handleDelete(id: string) {
    const hasSubs = categories.some((c) => c.parent_id === id);
    if (hasSubs) { alert("Сначала удалите или переместите подкатегории"); return; }
    if (!confirm("Удалить категорию?")) return;
    const result = await deleteCategory(id);
    if (!result.ok) { alert(result.error); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">Категорий: {categories.length}</p>
        <button
          onClick={() => openNew(null)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Добавить категорию
        </button>
      </div>

      <div className="space-y-1">
        {parents.map((parent) => {
          const children = subs.filter((s) => s.parent_id === parent.id);
          const parentLocked =
            usedCategoryIds.has(parent.id) ||
            children.some((s) => usedCategoryIds.has(s.id));
          return (
            <div key={parent.id}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group">
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold">{parent.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{parent.id}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openNew(parent.id)}
                    title="Добавить подкатегорию"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-green-100 text-gray-400 hover:text-green-600 hover:cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(parent)}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 hover:cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {!parentLocked && (
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 hover:cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {children.map((sub) => {
                const subLocked = usedCategoryIds.has(sub.id);
                return (
                  <div key={sub.id} className="flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg hover:bg-gray-50 group">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700">{sub.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{sub.id}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(sub)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 hover:cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {!subLocked && (
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-100 text-gray-400 hover:text-red-600 hover:cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">
                {editing.isNew ? "Новая категория" : "Редактировать категорию"}
              </h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-700 hover:cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ID (slug) *</label>
                <input
                  value={editing.id}
                  onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  disabled={!editing.isNew}
                  className={`${inp} disabled:bg-gray-50 disabled:text-gray-400`}
                  placeholder="household-chemicals"
                />
                {!editing.isNew && (
                  <p className="text-xs text-gray-400 mt-1">ID нельзя изменить — он используется в URL и продуктах</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Название *</label>
                <input
                  value={editing.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inp}
                  placeholder="Бытовая химия"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Родительская категория</label>
                <select
                  value={editing.parent_id ?? ""}
                  onChange={(e) => set("parent_id", e.target.value || null)}
                  className={inp}
                >
                  <option value="">— Верхний уровень</option>
                  {parents
                    .filter((p) => p.id !== editing.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={save}
                disabled={saving}
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
