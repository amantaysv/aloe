"use client";

import { useState, useTransition } from "react";
import { saveProfile } from "./actions";

type Props = {
  initial: { name: string; phone: string; address: string };
};

export default function ProfileForm({ initial }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setName(initial.name);
    setPhone(initial.phone);
    setAddress(initial.address);
    setError("");
    setEditing(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      try {
        await saveProfile({ name, phone, address });
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      }
    });
  }

  const inputCls = (active: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm transition-colors ${
      active
        ? "focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        : "bg-gray-50 text-gray-500 cursor-default"
    }`;

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Личные данные</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Изменить
          </button>
        )}
      </div>

      {!editing && !initial.name && !initial.phone && !initial.address && (
        <p className="text-sm text-gray-400">Данные не заполнены. Нажмите «Изменить» чтобы добавить.</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!editing}
          placeholder="Ваше имя"
          className={inputCls(editing)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!editing}
          placeholder="+996 700 000 000"
          className={inputCls(editing)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={!editing}
          placeholder="Город, улица, дом, квартира"
          className={inputCls(editing)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-green-600">Данные сохранены ✓</p>}

      {editing && (
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      )}
    </form>
  );
}
