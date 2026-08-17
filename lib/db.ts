import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Supabase responses are a discriminated union (`{data, error: null} | {data: null, error}`), so
 * these infer from the argument rather than from a `{ data: T | null }` shape — the latter
 * collapses T to `never` when the union is passed in.
 */
type Res = { data: unknown; error: PostgrestError | null };
type Data<R extends Res> = NonNullable<R["data"]>;

/** PGRST116 is .single()'s "no rows" / "more than one row" — an absent record, not a fault. */
const NOT_FOUND = "PGRST116";

/**
 * A failed query used to be indistinguishable from an empty one: services destructured only
 * `{ data }`, so a database outage, an RLS denial or a malformed filter all rendered as "no
 * products" with nothing in the logs.
 *
 * Use `soft` where an empty result is something the page can legitimately render, and `strict`
 * where it is not — in particular anywhere the result decides `notFound()`, since returning empty
 * there turns a transient error into a 404 that then gets cached.
 */
export function soft<R extends Res>(label: string, res: R, fallback: Data<R>): Data<R> {
  if (res.error) console.error(`[${label}] ${res.error.message}`);
  return (res.data ?? fallback) as Data<R>;
}

export function strict<R extends Res>(label: string, res: R): Data<R> {
  if (res.error) throw new Error(`[${label}] ${res.error.message}`);
  if (res.data == null) throw new Error(`[${label}] returned no data`);
  return res.data as Data<R>;
}

/** For `.single()` lookups where "not found" is expected and distinct from "failed". */
export function maybe<R extends Res>(label: string, res: R): Data<R> | null {
  if (res.error && res.error.code !== NOT_FOUND) throw new Error(`[${label}] ${res.error.message}`);
  return (res.data ?? null) as Data<R> | null;
}
