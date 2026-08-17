import { describe, expect, it } from "vitest";
import { DELIVERY_OPTIONS, FREE_DELIVERY_THRESHOLD, getDeliveryCost } from "@/lib/constants";

describe("getDeliveryCost", () => {
  it("charges the option's cost below the free-delivery threshold", () => {
    expect(getDeliveryCost("center", FREE_DELIVERY_THRESHOLD - 1)).toBe(200);
  });

  it("waives the cost at and above the threshold, but only where the option allows it", () => {
    expect(getDeliveryCost("center", FREE_DELIVERY_THRESHOLD)).toBe(0);
    expect(getDeliveryCost("center", FREE_DELIVERY_THRESHOLD + 5000)).toBe(0);
    // Жилмассивы are never free, however large the order.
    expect(getDeliveryCost("residential", FREE_DELIVERY_THRESHOLD * 10)).toBe(300);
  });

  it("returns 0 for an unknown option rather than throwing", () => {
    expect(getDeliveryCost("nope", 5000)).toBe(0);
  });

  it("covers every configured option", () => {
    for (const option of DELIVERY_OPTIONS) {
      expect(getDeliveryCost(option.id, 1)).toBe(option.cost);
    }
  });
});
