import { describe, expect, it } from "vitest";

/**
 * Mirrors validateCategoryDepth's arithmetic in app/admin/actions.ts. The action itself needs a
 * Supabase client, so the rule is restated here — this is the constraint that keeps a subtree from
 * being pushed to level 4, where the admin UI (three levels) and the storefront (levels 2-3) both
 * stop seeing it, with no way back through the interface.
 */
const MAX_DEPTH = 3;

function wouldExceed(parentDepth: number, subtreeHeight: number): boolean {
  return parentDepth + subtreeHeight > MAX_DEPTH;
}

describe("category depth rule", () => {
  it("allows a leaf anywhere the UI renders", () => {
    expect(wouldExceed(0, 1)).toBe(false); // new top-level
    expect(wouldExceed(1, 1)).toBe(false); // under a top-level category
    expect(wouldExceed(2, 1)).toBe(false); // under a subcategory
  });

  it("rejects a leaf below the third level", () => {
    expect(wouldExceed(3, 1)).toBe(true);
  });

  it("accounts for the height of the subtree being moved, not just the target", () => {
    // A subcategory that has sub-subcategories is 2 tall. Under a top-level category it fits...
    expect(wouldExceed(1, 2)).toBe(false);
    // ...but under another subcategory its children would land on level 4.
    expect(wouldExceed(2, 2)).toBe(true);
    // Three-tall subtrees only fit at the very top.
    expect(wouldExceed(0, 3)).toBe(false);
    expect(wouldExceed(1, 3)).toBe(true);
  });
});
