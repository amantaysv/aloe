import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Anonymous read-only client shared across requests, used by the `unstable_cache` wrappers.
 * Session handling is off: on the server there is no session to persist, and the defaults would
 * otherwise keep a process-wide token store and a refresh timer on a client that every request
 * shares — one `.auth.*` call away from leaking a session between visitors.
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
