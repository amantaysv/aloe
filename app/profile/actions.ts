"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { saveProfile } from "@/services/profile.service";

export async function saveProfile({ name, phone, address }: { name: string; phone: string; address: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Не авторизован");

  const error = await saveProfile(supabase, user.id, { name, phone, address });
  if (error) throw new Error(error.message);

  revalidatePath("/profile");
}
