import { SITE_URL } from "@/lib/constants";

/**
 * Only same-origin relative paths may be redirected to. Bare concatenation onto an origin lets
 * `next=@evil.com` resolve to a foreign host and `next=.evil.com` to a lookalike subdomain.
 */
export function safeRedirect(next: string | null | undefined, base: string, fallback = "/auth?confirmed=true"): URL {
  if (next && /^\/(?![/\\])/.test(next)) {
    try {
      const url = new URL(next, base);
      if (url.origin === new URL(base).origin) return url;
    } catch {
      // fall through to the default below
    }
  }
  return new URL(fallback, base);
}

/**
 * `x-forwarded-host` is client-controllable unless every proxy in front of us strips it, so only
 * hosts we actually deploy to are honoured.
 */
export function resolveOrigin(forwardedHost: string | null | undefined, requestOrigin: string): string {
  if (!forwardedHost) return requestOrigin;

  const allowed = new URL(SITE_URL).host;
  const host = forwardedHost.split(",")[0].trim();
  const isAllowed = host === allowed || host.endsWith(`.${allowed}`) || host.endsWith(".vercel.app");
  return isAllowed ? `https://${host}` : SITE_URL;
}
