import { describe, expect, it } from "vitest";

import {
  isCommerceStatus,
  isFulfillmentStatus,
  isOfflineSaleChannel,
} from "@/lib/ops/types";

describe("ops type guards", () => {
  it("accepts offline sale channels only", () => {
    expect(isOfflineSaleChannel("feria")).toBe(true);
    expect(isOfflineSaleChannel("online")).toBe(false);
    expect(isOfflineSaleChannel(1)).toBe(false);
  });

  it("accepts commerce statuses", () => {
    expect(isCommerceStatus("available")).toBe(true);
    expect(isCommerceStatus("made_to_order")).toBe(true);
    expect(isCommerceStatus("nope")).toBe(false);
  });

  it("accepts fulfillment statuses", () => {
    expect(isFulfillmentStatus("shipped")).toBe(true);
    expect(isFulfillmentStatus("paid")).toBe(false);
  });
});
