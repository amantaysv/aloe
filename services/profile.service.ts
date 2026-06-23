import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("name, phone, address")
    .eq("id", userId)
    .single();
  return data;
}

export async function saveProfile(
  supabase: SupabaseClient,
  userId: string,
  data: { name: string; phone: string; address: string },
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      name: data.name,
      phone: data.phone,
      address: data.address,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  return error;
}
