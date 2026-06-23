import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getUserOrders } from "@/services/order.service";
import { getProfile } from "@/services/profile.service";
import ProfileTabs from "./ProfileTabs";

export const metadata = { title: "Профиль — Aloe.kg" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const [orders, profile] = await Promise.all([
    getUserOrders(supabase, user.id),
    getProfile(supabase, user.id),
  ]);

  const initial = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Мой профиль</h1>

      <div className="border border-gray-300 rounded-xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
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

      <ProfileTabs initial={initial} orders={orders as Parameters<typeof ProfileTabs>[0]["orders"]} />
    </main>
  );
}
