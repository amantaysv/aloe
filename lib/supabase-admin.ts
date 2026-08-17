import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client: bypasses RLS entirely. Never construct this without an admin check
 * (`requireAdmin` in lib/auth.ts, or `assertAdmin` inside a server action) immediately before
 * it — the guest-checkout path in app/checkout/actions.ts is the one deliberate exception,
 * and it re-derives every value it writes.
 *
 * Session handling is off: on the server there is no session to persist, and leaving the
 * refresh timer on would keep a process-wide token store on a client shared across requests.
 */
export function createAdminClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
