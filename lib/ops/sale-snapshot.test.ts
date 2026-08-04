import { describe, expect, it } from "vitest";

import { computeSaleTotals } from "@/lib/ops/sale-snapshot";

describe("computeSaleTotals", () => {
  it("computes revenue, cogs and gross profit", () => {
    expect(
      computeSaleTotals([
        { qty: 2, unitPrice: 1000, unitCost: 400 },
        { qty: 1, unitPrice: 500, unitCost: 100 },
      ]),
    ).toEqual({
      revenue: 2500,
      cogs: 900,
      grossProfit: 1600,
      missingCostItemCount: 0,
    });
  });

  it("counts missing cost lines and treats invalid qty/price as zero", () => {
    expect(
      computeSaleTotals([
        { qty: 2, unitPrice: 1000 },
        { qty: 0, unitPrice: 999, unitCost: 10 },
        { qty: -1, unitPrice: 50 },
        { qty: 1, unitPrice: -5, unitCost: 20 },
      ]),
    ).toEqual({
      revenue: 2000,
      cogs: 20,
      grossProfit: 1980,
      missingCostItemCount: 1,
    });
  });

  it("returns zeros for empty items", () => {
    expect(computeSaleTotals([])).toEqual({
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      missingCostItemCount: 0,
    });
  });
});
