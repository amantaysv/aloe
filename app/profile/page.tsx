import MainContainer from "@/components/MainContainer";
import Title from "@/components/Title";
import { requireAuth } from "@/lib/auth";
import { getUserOrders } from "@/services/order.service";
import { getProfile } from "@/services/profile.service";
import LogoutButton from "./LogoutButton";
import ProfileTabs from "./ProfileTabs";

export const metadata = { title: "Профиль — Aloe.kg" };

export default async function ProfilePage() {
  const { supabase, user } = await requireAuth();

  const [orders, profile] = await Promise.all([getUserOrders(supabase, user.id), getProfile(supabase, user.id)]);

  const initial = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  };

  return (
    <MainContainer className="max-w-2xl">
      <Title className="mb-6">Мой профиль</Title>

      <div className="border border-gray-300 rounded-xl p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="flex-1">
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
        <LogoutButton />
      </div>

      <ProfileTabs initial={initial} orders={orders as Parameters<typeof ProfileTabs>[0]["orders"]} />
    </MainContainer>
  );
}
