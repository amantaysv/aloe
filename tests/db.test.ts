import type { PostgrestError } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { maybe, soft, strict } from "@/lib/db";

const ok = <T>(data: T) => ({ data, error: null });

const err = (message: string, code: string): PostgrestError =>
  ({ message, code, details: "", hint: "", name: "PostgrestError" }) as PostgrestError;

const failed = <T = unknown>(message = "connection refused", code = "08006") => ({
  data: null as T | null,
  error: err(message, code),
});
const noRows = <T = unknown>() => failed<T>("no rows", "PGRST116");

describe("soft", () => {
  it("returns the data when the query succeeded", () => {
    expect(soft("x", ok([1, 2]), [])).toEqual([1, 2]);
  });

  // The whole point: a failed query used to be indistinguishable from an empty one, with
  // nothing in the logs to tell them apart.
  it("logs and falls back when the query failed", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(soft("banners", failed<number[]>(), [])).toEqual([]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[banners]"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("connection refused"));
    spy.mockRestore();
  });

  it("falls back on a null payload without an error", () => {
    expect(soft("x", ok<string | null>(null), "default")).toBe("default");
  });
});

describe("strict", () => {
  it("returns the data when the query succeeded", () => {
    expect(strict("x", ok([{ id: 1 }]))).toEqual([{ id: 1 }]);
  });

  // Used where the result decides notFound(): swallowing the error there turns a transient
  // outage into a 404 that then gets cached.
  it("throws on a failed query, naming the source", () => {
    expect(() => strict("category-products", failed<unknown[]>())).toThrow(/\[category-products\].*connection refused/);
  });

  it("throws when the payload is null", () => {
    expect(() => strict("categories", ok<unknown[] | null>(null))).toThrow(/returned no data/);
  });

  it("accepts an empty array as a real answer", () => {
    expect(strict("x", ok([]))).toEqual([]);
  });
});

describe("maybe", () => {
  // Call sites use .maybeSingle(), which reports "no rows" as data: null with no error at all.
  it("returns null when the row is simply absent", () => {
    expect(maybe("brand-by-slug", ok<{ id: number } | null>(null))).toBeNull();
  });

  it("still throws on a genuine failure", () => {
    expect(() => maybe("brand-by-slug", failed<{ id: number }>())).toThrow(/connection refused/);
  });

  // .single() reports "more than one row" with the same PGRST116 it uses for zero rows, so
  // excusing that code hid duplicate slugs behind a 404. Every error surfaces now.
  it("throws on PGRST116 too, since it also means more than one row", () => {
    expect(() => maybe("brand-by-slug", noRows<{ id: number }>())).toThrow(/\[brand-by-slug\]/);
  });

  it("returns the row when found", () => {
    expect(maybe("x", ok({ id: 7 }))).toEqual({ id: 7 });
  });
});
