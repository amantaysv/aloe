"use client";

import { useState } from "react";
import { ChevronRightIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import Button from "@/components/Button";
import { deleteCategory, upsertCategory, type CategoryInput } from "./actions";
import { adminInputCls as inp, Field } from "./admin-ui";

type Category = { id: number; name: string; parent_id: number | null; slug: string };

const empty: CategoryInput = { name: "", parent_id: null, slug: "" };

export default function AdminCategories({
  categories: initial,
  usedCategoryIds: usedIds,
}: {
  categories: Category[];
  usedCategoryIds: number[];
}) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<(CategoryInput & { isNew: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parents = categories.filter((c) => !c.parent_id);
  const subs = categories.filter((c) => c.parent_id);
  const usedCategoryIds = new Set(usedIds);

  function openNew(parentId: number | null = null) {
    setEditing({ ...empty, parent_id: parentId, isNew: true });
    setError("");
  }

  function openEdit(c: Category) {
    setEditing({ id: c.id, name: c.name, parent_id: c.parent_id, slug: c.slug, isNew: false });
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
    if (!editing.slug.trim() || !editing.name.trim()) {
      setError("Slug и название обязательны");
      return;
    }
    setSaving(true);
    setError("");
    const result = await upsertCategory({
      id: editing.id,
      name: editing.name.trim(),
      parent_id: editing.parent_id,
      slug: editing.slug.trim(),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCategories((prev) => {
      const exists = prev.find((c) => c.id === editing.id);
      if (exists)
        return prev.map((c) =>
          c.id === editing.id
            ? { ...c, name: editing.name.trim(), parent_id: editing.parent_id, slug: editing.slug.trim() }
            : c,
        );
      return [
        ...prev,
        { id: result.id, name: editing.name.trim(), parent_id: editing.parent_id, slug: editing.slug.trim() },
      ];
    });
    close();
  }

  async function handleDelete(id: number) {
    const hasSubs = categories.some((c) => c.parent_id === id);
    if (hasSubs) {
      alert("Сначала удалите или переместите подкатегории");
      return;
    }
    if (!confirm("Удалить категорию?")) return;
    const result = await deleteCategory(id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-gray-500">Категорий: {categories.length}</p>
        <Button variant="primary" onClick={() => openNew(null)} className="flex items-center gap-1.5">
          <PlusIcon className="size-4" />
          Добавить категорию
        </Button>
      </div>

      <div className="space-y-1">
        {parents.map((parent) => {
          const children = subs.filter((s) => s.parent_id === parent.id);
          const parentLocked = usedCategoryIds.has(parent.id) || children.some((s) => usedCategoryIds.has(s.id));
          return (
            <div key={parent.id}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 group">
                <ChevronRightIcon className="size-4 text-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold">{parent.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{parent.slug}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="icon"
                    iconColor="green"
                    size="sm"
                    onClick={() => openNew(parent.id)}
                    title="Добавить подкатегорию"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                  <Button variant="icon" size="sm" onClick={() => openEdit(parent)}>
                    <PencilIcon className="size-4" />
                  </Button>
                  {!parentLocked && (
                    <Button variant="icon" iconColor="danger" size="sm" onClick={() => handleDelete(parent.id)}>
                      <Trash2Icon className="size-4" />
                    </Button>
                  )}
                </div>
              </div>

              {children.map((sub) => {
                const subLocked = usedCategoryIds.has(sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg hover:bg-gray-50 group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700">{sub.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{sub.slug}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="icon" size="sm" onClick={() => openEdit(sub)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      {!subLocked && (
                        <Button variant="icon" iconColor="danger" size="sm" onClick={() => handleDelete(sub.id)}>
                          <Trash2Icon className="size-4" />
                        </Button>
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
              <h2 className="text-lg font-bold">{editing.isNew ? "Новая категория" : "Редактировать категорию"}</h2>
              <Button onClick={close} className="text-gray-400 hover:text-gray-700">
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
                  placeholder="bytovaya-khimiya"
                />
                <p className="text-xs text-gray-400 mt-1">Используется в URL: /catalog/slug</p>
              </Field>

              <Field label="Название *">
                <input
                  value={editing.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inp}
                  placeholder="Бытовая химия"
                />
              </Field>

              <Field label="Родительская категория">
                <select
                  value={editing.parent_id ?? ""}
                  onChange={(e) => set("parent_id", e.target.value ? parseInt(e.target.value) : null)}
                  className={inp}
                >
                  <option value="">— Верхний уровень</option>
                  {parents
                    .filter((p) => p.id !== editing.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
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

