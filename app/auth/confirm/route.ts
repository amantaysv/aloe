import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase-server";

/**
 * `x-forwarded-host` is client-controllable unless every proxy in front of us strips it,
 * so only hosts we actually deploy to are honoured.
 */
function resolveOrigin(request: NextRequest, origin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return origin;

  const allowed = new URL(SITE_URL).host;
  const host = forwardedHost.split(",")[0].trim();
  const isAllowed = host === allowed || host.endsWith(`.${allowed}`) || host.endsWith(".vercel.app");
  return isAllowed ? `https://${host}` : SITE_URL;
}

/**
 * Only same-origin relative paths may be redirected to. Bare concatenation would let
 * `next=@evil.com` resolve to a foreign host, and `next=.evil.com` to a lookalike subdomain.
 */
function safeRedirect(next: string | null, base: string): URL {
  if (next && /^\/(?![/\\])/.test(next)) {
    try {
      const url = new URL(next, base);
      if (url.origin === new URL(base).origin) return url;
    } catch {
      // fall through to the default below
    }
  }
  return new URL("/auth?confirmed=true", base);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const resolvedOrigin = resolveOrigin(request, origin);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  // OTP flow: token_hash in the link (email template sends directly to our app)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${resolvedOrigin}/auth?confirmed=true`);
    }
    return NextResponse.redirect(`${resolvedOrigin}/auth?error=confirmation_failed`);
  }

  // PKCE / OAuth flow: code exchange
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const next = searchParams.get("next");
    if (!error) {
      if (next) {
        return NextResponse.redirect(safeRedirect(next, resolvedOrigin));
      }
      await supabase.auth.signOut();
      return NextResponse.redirect(`${resolvedOrigin}/auth?confirmed=true`);
    }
    return NextResponse.redirect(`${resolvedOrigin}/auth?error=confirmation_failed`);
  }

  return NextResponse.redirect(`${resolvedOrigin}/auth?error=confirmation_failed`);
}
