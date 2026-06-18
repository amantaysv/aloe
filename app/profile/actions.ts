"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function saveProfile({
  name,
  phone,
  address,
}: {
  name: string;
  phone: string;
  address: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Не авторизован");

  const { error } = await supabase.from("profiles").upsert(
    { id: user.id, name, phone, address, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
}
