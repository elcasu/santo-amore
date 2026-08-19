import { describe, expect, it, vi } from "vitest";

vi.mock("@/sanity/lib/client", () => ({ client: {} }));
vi.mock("@/sanity/lib/write-client", () => ({
  getWriteClient: () => ({}),
}));

import {
  groupTrackedStockDeductions,
  nextStockQty,
  shouldDecrementTrackedStock,
  stockPatchForDeduction,
  type StockDeductionInput,
} from "@/lib/ops/stock";

function line(
  overrides: Partial<StockDeductionInput> &
    Pick<StockDeductionInput, "productId" | "qty">,
): StockDeductionInput {
  return {
    trackInventory: true,
    commerceStatus: "available",
    currentStock: 5,
    ...overrides,
  };
}

describe("shouldDecrementTrackedStock", () => {
  it("decrements available tracked inventory", () => {
    expect(
      shouldDecrementTrackedStock({
        trackInventory: true,
        commerceStatus: "available",
      }),
    ).toBe(true);
  });

  it("skips products without trackInventory", () => {
    expect(
      shouldDecrementTrackedStock({
        trackInventory: false,
        commerceStatus: "available",
      }),
    ).toBe(false);
  });

  it("skips made_to_order even if inventory is tracked", () => {
    expect(
      shouldDecrementTrackedStock({
        trackInventory: true,
        commerceStatus: "made_to_order",
      }),
    ).toBe(false);
  });
});

describe("nextStockQty / stockPatchForDeduction", () => {
  it("floors at zero and marks sold_out", () => {
    expect(nextStockQty(2, 5)).toBe(0);
    expect(stockPatchForDeduction({ currentStock: 2, qty: 5 })).toEqual({
      stockQty: 0,
      commerceStatus: "sold_out",
    });
  });

  it("treats missing stock as zero", () => {
    expect(nextStockQty(undefined, 1)).toBe(0);
    expect(stockPatchForDeduction({ currentStock: undefined, qty: 1 })).toEqual({
      stockQty: 0,
      commerceStatus: "sold_out",
    });
  });

  it("keeps commerceStatus when units remain", () => {
    expect(stockPatchForDeduction({ currentStock: 4, qty: 1 })).toEqual({
      stockQty: 3,
    });
  });
});

describe("groupTrackedStockDeductions", () => {
  it("sums qty per product and drops non-tracked / made_to_order lines", () => {
    const grouped = groupTrackedStockDeductions([
      line({ productId: "a", qty: 1, currentStock: 10 }),
      line({ productId: "a", qty: 2, currentStock: 10 }),
      line({ productId: "b", qty: 1, trackInventory: false }),
      line({
        productId: "c",
        qty: 1,
        commerceStatus: "made_to_order",
        currentStock: 3,
      }),
    ]);

    expect(grouped).toEqual([
      line({ productId: "a", qty: 3, currentStock: 10 }),
    ]);
  });
});
