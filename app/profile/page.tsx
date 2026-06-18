import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Мой профиль</h1>

      <div className="border rounded-xl p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
          {user.email?.[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{user.email}</p>
          <p className="text-sm text-gray-400">
            Зарегистрирован:{" "}
            {new Date(user.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">История заказов</h2>

      {!orders || orders.length === 0 ? (
        <p className="text-gray-400 text-sm">Заказов пока нет.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {(orders as Order[]).map((order) => (
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
                  <p className="text-sm font-medium mt-0.5">
                    Заказ #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <ul className="text-sm text-gray-600 mb-3 flex flex-col gap-1">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
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
          ))}
        </div>
      )}
    </main>
  );
}
