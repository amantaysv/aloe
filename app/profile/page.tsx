import { MainContainer, MobileHeader, Title } from "@/components";
import { requireAuth } from "@/lib/auth";
import { getUserOrders } from "@/services/order.service";
import { getProfile } from "@/services/profile.service";
import LogoutButton from "./LogoutButton";
import ProfileTabs from "./ProfileTabs";

export const metadata = { title: "Профиль — Aloe.kg", robots: { index: false, follow: true } };

export default async function ProfilePage() {
  const { supabase, user } = await requireAuth();

  const [orders, profile] = await Promise.all([getUserOrders(supabase, user.id), getProfile(supabase, user.id)]);

  const initial = {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
  };

  return (
    <>
      <MobileHeader title="Мой профиль">
        <span className="absolute right-4">
          <LogoutButton />
        </span>
      </MobileHeader>
      <MainContainer className="max-w-2xl">
        <Title className="hidden md:block mb-6">Мой профиль</Title>

        <div className="flex md:hidden flex-col items-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shrink-0">
            {user.email?.[0].toUpperCase()}
          </div>
          <h2 className="text-3xl">{profile?.name}</h2>
        </div>

        <div className="hidden md:flex border border-gray-300 rounded-xl p-5 mb-6 items-center gap-4">
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
    </>
  );
}
