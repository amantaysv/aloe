import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  // OTP flow: token_hash in the link (email template sends directly to our app)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}/auth?confirmed=true`);
    }
    return NextResponse.redirect(`${origin}/auth?error=confirmation_failed`);
  }

  // PKCE / OAuth flow: code exchange
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const next = searchParams.get("next");
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/auth?confirmed=true`);
    }
    return NextResponse.redirect(`${origin}/auth?error=confirmation_failed`);
  }

  return NextResponse.redirect(`${origin}/auth?error=confirmation_failed`);
}
