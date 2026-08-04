import { describe, expect, it } from "vitest";

import { mapPaymentStatus } from "@/lib/mercadopago/map-payment-status";

describe("mapPaymentStatus", () => {
  it("maps approved to paid", () => {
    expect(mapPaymentStatus("approved")).toBe("paid");
  });

  it("maps rejected and cancelled to rejected", () => {
    expect(mapPaymentStatus("rejected")).toBe("rejected");
    expect(mapPaymentStatus("cancelled")).toBe("rejected");
  });

  it("maps refunded and charged_back to cancelled", () => {
    expect(mapPaymentStatus("refunded")).toBe("cancelled");
    expect(mapPaymentStatus("charged_back")).toBe("cancelled");
  });

  it("returns null for pending-like statuses", () => {
    expect(mapPaymentStatus("pending")).toBeNull();
    expect(mapPaymentStatus("in_process")).toBeNull();
    expect(mapPaymentStatus(undefined)).toBeNull();
  });
});
