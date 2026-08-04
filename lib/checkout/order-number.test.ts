import { describe, expect, it } from "vitest";

import { orderNumberFromRef } from "@/lib/checkout/order-number";

describe("orderNumberFromRef", () => {
  it("builds SA- prefix from first 8 hex chars of UUID", () => {
    expect(orderNumberFromRef("a1b2c3d4-e5f6-7890-abcd-ef0123456789")).toBe(
      "SA-A1B2C3D4",
    );
  });

  it("uppercases and strips hyphens", () => {
    expect(orderNumberFromRef("abcd-ef")).toBe("SA-ABCDEF");
  });
});
