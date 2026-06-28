"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Currency, Pagination } from "@/components";
import { ORDER_STATUS } from "@/lib/constants";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import ProfileForm from "./ProfileForm";

type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    image_url: string;
  }[];
};

type Profile = {
  name: string;
  phone: string;
  address: string;
};

const PAGE_SIZE = 10;

export default function ProfileTabs({ initial, orders }: { initial: Profile; orders: Order[] }) {
  const [tab, setTab] = useState<"profile" | "orders">("orders");
  const [page, setPage] = useState(1);
  const { add } = useCart();
  const { show } = useToast();
  const router = useRouter();

  function repeatOrder(order: Order) {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
      }
    });
    show("Товары добавлены в корзину", "success");
    router.push("/cart");
  }

  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const paginated = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        {(["orders", "profile"] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "profile" ? "Личные данные" : `История заказов${orders.length > 0 ? ` (${orders.length})` : ""}`}
          </Button>
        ))}
      </div>

      {tab === "profile" && <ProfileForm initial={initial} />}

      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">Заказов пока нет.</p>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {paginated.map((order) => {
                  const s = ORDER_STATUS[order.status] ?? ORDER_STATUS.new;
                  return (
                    <div key={order.id} className="border border-gray-300 rounded-xl p-4">
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
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      </div>

                      <ul className="text-sm text-gray-600 mb-3 flex flex-col gap-1">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>
                              {(item.price * item.quantity).toLocaleString("ru-RU")} <Currency />
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-between items-center border-t border-gray-300 pt-2">
                        <span className="font-semibold text-sm">
                          Итого: {order.total.toLocaleString("ru-RU")} <Currency />
                        </span>
                        <Button variant="secondary" onClick={() => repeatOrder(order)} className="text-xs px-3 py-1.5">
                          Повторить заказ
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </>
  );
}
