import { describe, expect, it } from "vitest";
import { withBrandName } from "@/types";

describe("withBrandName", () => {
  it("flattens the embedded brand and drops the nested object", () => {
    const [row] = withBrandName([{ id: 1, brands: { name: "Nivea" } }]);
    expect(row).toEqual({ id: 1, brand_name: "Nivea" });
    expect("brands" in row).toBe(false);
  });

  it("yields null when a product has no brand", () => {
    expect(withBrandName([{ id: 1, brands: null }])[0].brand_name).toBeNull();
    // A row where the embed is absent entirely, not just null.
    const withoutEmbed: { id: number; brands?: { name: string } | null }[] = [{ id: 1 }];
    expect(withBrandName(withoutEmbed)[0].brand_name).toBeNull();
  });

  it("preserves every other column", () => {
    const [row] = withBrandName([{ id: 7, name: "Крем", price: 250, brands: null }]);
    expect(row).toMatchObject({ id: 7, name: "Крем", price: 250 });
  });

  it("handles an empty result set", () => {
    expect(withBrandName([])).toEqual([]);
  });
});
