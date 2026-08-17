import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * 301s the previous site's product URLs to the current ones.
 *
 * `products.product_url` holds 2401 addresses of the form
 * `https://aloe.kg/catalog/product/view/21/6865.html` — the *same* domain, from the old version of
 * the shop. Nothing redirected them, so every one of those links, wherever it is indexed or
 * published, landed on the not-found page. The mapping was already in the database; both earlier
 * audits skipped the column because it is marked unused in the docs.
 *
 * Matched dynamically rather than as thousands of `redirects()` entries, so it stays correct when
 * products change and costs nothing until an old link is actually followed.
 */
export const revalidate = 86400;

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const oldPath = `/catalog/product/view/${path.join("/")}`;

  const db = createAdminClient();
  const { data, error } = await db
    .from("products")
    .select("id")
    .like("product_url", `%${oldPath}`)
    .eq("published", true)
    .limit(1);

  if (error) console.error(`[legacy-redirect] lookup failed for ${oldPath}: ${error.message}`);

  const id = data?.[0]?.id;
  // No match: send them to the catalogue rather than a dead end, and keep it a 302 so a future
  // match isn't cached away.
  if (!id) return NextResponse.redirect(new URL("/catalog", SITE_URL), 302);

  return NextResponse.redirect(new URL(`/product/${id}`, SITE_URL), 301);
}
