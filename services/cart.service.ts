import type { SupabaseClient } from "@supabase/supabase-js";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartRow = {
  product_id: number;
  quantity: number;
  products: { name: string; price: number; image_url: string } | null;
};

export async function loadCart(supabase: SupabaseClient, userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price, image_url)")
    .eq("user_id", userId);

  if (error) {
    console.error("[cart] load error:", error.message);
    return [];
  }

  return (data as unknown as CartRow[])
    .filter((r) => r.products !== null)
    .map((r) => ({
      id: r.product_id,
      name: r.products!.name,
      price: r.products!.price,
      image_url: r.products!.image_url,
      quantity: r.quantity,
    }));
}

export async function upsertCartItem(
  supabase: SupabaseClient,
  userId: string,
  productId: number,
  quantity: number,
) {
  const { error } = await supabase
    .from("cart_items")
    .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: "user_id,product_id" });
  if (error) console.error("[cart] upsert error:", error.message);
}

export async function deleteCartItem(supabase: SupabaseClient, userId: string, productId: number) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) console.error("[cart] delete error:", error.message);
}

export async function clearCart(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (error) console.error("[cart] clear error:", error.message);
}

export async function reconcileCartItems(
  supabase: SupabaseClient,
  userId: string,
  items: { id: number; quantity: number }[],
) {
  const { error } = await supabase
    .from("cart_items")
    .upsert(
      items.map((i) => ({ user_id: userId, product_id: i.id, quantity: i.quantity })),
      { onConflict: "user_id,product_id" },
    );
  if (error) console.error("[cart] reconcile error:", error.message);
}
