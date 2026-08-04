import { describe, expect, it } from "vitest";

import { getMaxQty } from "@/lib/cart/limits";

describe("getMaxQty", () => {
  it("defaults to 99 when no caps", () => {
    expect(getMaxQty({ trackInventory: false })).toBe(99);
  });

  it("uses maxPerOrder when present", () => {
    expect(
      getMaxQty({ trackInventory: false, maxPerOrder: 3 }),
    ).toBe(3);
  });

  it("uses stock when inventory is tracked", () => {
    expect(
      getMaxQty({ trackInventory: true, stockQty: 5 }),
    ).toBe(5);
  });

  it("takes the minimum of stock and maxPerOrder", () => {
    expect(
      getMaxQty({
        trackInventory: true,
        stockQty: 10,
        maxPerOrder: 2,
      }),
    ).toBe(2);
  });

  it("floors at 1 even if stock is 0", () => {
    expect(
      getMaxQty({ trackInventory: true, stockQty: 0 }),
    ).toBe(1);
  });

  it("ignores non-positive maxPerOrder", () => {
    expect(
      getMaxQty({ trackInventory: false, maxPerOrder: 0 }),
    ).toBe(99);
  });
});
