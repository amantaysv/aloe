"use client";

import { useState } from "react";
import ProfileForm from "./ProfileForm";

type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
};

type Profile = { name: string; phone: string; address: string };

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new:        { label: "Новый",       cls: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Подтверждён", cls: "bg-yellow-100 text-yellow-700" },
  processing: { label: "В доставке",  cls: "bg-orange-100 text-orange-700" },
  delivered:  { label: "Доставлен",   cls: "bg-green-100 text-green-700" },
  cancelled:  { label: "Отменён",     cls: "bg-red-100 text-red-600" },
};

const PAGE_SIZE = 10;

export default function ProfileTabs({
  initial,
  orders,
}: {
  initial: Profile;
  orders: Order[];
}) {
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(["profile", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "profile" ? "Личные данные" : `История заказов${orders.length > 0 ? ` (${orders.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileForm initial={initial} />}

      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">Заказов пока нет.</p>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {paginated.map((order) => {
                  const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.new;
                  return (
                    <div key={order.id} className="border rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm font-medium mt-0.5">Заказ #{order.id}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>
                          {s.label}
                        </span>
                      </div>

                      <ul className="text-sm text-gray-600 mb-3 flex flex-col gap-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{item.name} × {item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString("ru-RU")} сом</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-end border-t pt-2">
                        <span className="font-semibold text-sm">
                          Итого: {order.total.toLocaleString("ru-RU")} сом
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm border rounded-lg ${
                        p === page ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
