import { describe, expect, it, vi } from "vitest";
import { maybe, soft, strict } from "@/lib/db";

const ok = <T>(data: T) => ({ data, error: null });
const failed = (message = "connection refused", code = "08006") => ({
  data: null,
  error: { message, code, details: "", hint: "", name: "PostgrestError" },
});
const noRows = () => ({ ...failed("no rows", "PGRST116"), data: null });

describe("soft", () => {
  it("returns the data when the query succeeded", () => {
    expect(soft("x", ok([1, 2]), [])).toEqual([1, 2]);
  });

  // The whole point: a failed query used to be indistinguishable from an empty one, with
  // nothing in the logs to tell them apart.
  it("logs and falls back when the query failed", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(soft("banners", failed(), [])).toEqual([]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[banners]"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("connection refused"));
    spy.mockRestore();
  });

  it("falls back on a null payload without an error", () => {
    expect(soft("x", ok(null), "default")).toBe("default");
  });
});

describe("strict", () => {
  it("returns the data when the query succeeded", () => {
    expect(strict("x", ok([{ id: 1 }]))).toEqual([{ id: 1 }]);
  });

  // Used where the result decides notFound(): swallowing the error there turns a transient
  // outage into a 404 that then gets cached.
  it("throws on a failed query, naming the source", () => {
    expect(() => strict("category-products", failed())).toThrow(/\[category-products\].*connection refused/);
  });

  it("throws when the payload is null", () => {
    expect(() => strict("categories", ok(null))).toThrow(/returned no data/);
  });

  it("accepts an empty array as a real answer", () => {
    expect(strict("x", ok([]))).toEqual([]);
  });
});

describe("maybe", () => {
  it("returns null for .single()'s no-rows code rather than throwing", () => {
    expect(maybe("brand-by-slug", noRows())).toBeNull();
  });

  it("still throws on a genuine failure", () => {
    expect(() => maybe("brand-by-slug", failed())).toThrow(/connection refused/);
  });

  it("returns the row when found", () => {
    expect(maybe("x", ok({ id: 7 }))).toEqual({ id: 7 });
  });
});
