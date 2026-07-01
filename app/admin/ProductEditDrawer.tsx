"use client";

import { X } from "lucide-react";
import { Button } from "@/components";
import type { ProductInput } from "./actions";
import { Field, adminInputCls as inp } from "./admin-ui";
import ImageDropzone from "./ImageDropzone";

const LABELS = [
  { value: "", label: "Нет" },
  { value: "popular", label: "Хит" },
  { value: "new", label: "Новинка" },
  { value: "sale", label: "Акция" },
];

type Props = {
  editing: ProductInput;
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  saving: boolean;
  uploading: boolean;
  error: string;
  onClose: () => void;
  onChange: <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => void;
  onFileSelect: (file: File) => void;
  onSave: () => void;
};

export default function ProductEditDrawer({
  editing,
  brands,
  categories,
  saving,
  uploading,
  error,
  onClose,
  onChange,
  onFileSelect,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{editing.id ? "Редактировать товар" : "Добавить товар"}</h2>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <ImageDropzone imageUrl={editing.image_url} uploading={uploading} onFileSelect={onFileSelect} />

          <Field label="Название *">
            <input
              value={editing.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={inp}
              placeholder="Например: Масло оливковое Extra Virgin"
            />
          </Field>

          <Field label="Производитель">
            <select
              value={editing.brand_id ?? ""}
              onChange={(e) => onChange("brand_id", e.target.value ? Number(e.target.value) : null)}
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
                    onChange("category_id", cat.id);
                    onChange("category", cat.name);
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
                onChange={(e) => onChange("label", (e.target.value as ProductInput["label"]) || null)}
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
                onChange={(e) => onChange("price", Number(e.target.value))}
                className={inp}
                placeholder="0"
                min={0}
              />
            </Field>
            <Field label="Старая цена">
              <input
                type="number"
                value={editing.old_price ?? ""}
                onChange={(e) => onChange("old_price", e.target.value ? Number(e.target.value) : null)}
                className={inp}
                placeholder="0"
                min={0}
              />
            </Field>
          </div>

          <Field label="Описание (Markdown)">
            <textarea
              value={editing.description ?? ""}
              onChange={(e) => onChange("description", e.target.value || null)}
              className={`${inp} min-h-35 resize-y font-mono text-xs`}
              placeholder={"## Заголовок\n\nОписание товара..."}
            />
          </Field>

          <Field label="SEO текст (keywords / title / description)">
            <textarea
              value={editing.seo_text ?? ""}
              onChange={(e) => onChange("seo_text", e.target.value || null)}
              className={`${inp} min-h-24 resize-y text-xs`}
              placeholder="Текст для мета-тегов keywords, title и description"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ссылка на товар">
              <input
                value={editing.product_url ?? ""}
                onChange={(e) => onChange("product_url", e.target.value)}
                className={inp}
                placeholder="https://..."
              />
            </Field>
            <Field label="External ID">
              <input
                value={editing.external_id ?? ""}
                onChange={(e) => onChange("external_id", e.target.value)}
                className={inp}
                placeholder="опционально"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editing.published ?? true}
              onChange={(e) => onChange("published", e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm font-medium text-gray-700">Опубликован</span>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <Button
            variant="primary"
            size="lg"
            onClick={onSave}
            disabled={saving || uploading || !editing.name || !editing.price}
            className="w-full"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
