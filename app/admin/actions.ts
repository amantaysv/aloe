"use server";
import { createClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = "amantay.sv@gmail.com";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}
