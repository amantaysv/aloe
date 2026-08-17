import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Anonymous visitors — the bulk of storefront traffic — have no Supabase cookie, so there is
  // no session to refresh. Bailing out here skips a network round trip to GoTrue on every
  // prerendered page and every RSC prefetch.
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Also excludes _next/data, the metadata routes and font/icon assets — none of them need
    // a refreshed session, and sitemap.xml/robots.txt were previously matched.
    "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|woff|woff2|ttf)$).*)",
  ],
};
