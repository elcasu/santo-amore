import { describe, expect, it, vi } from "vitest";

vi.mock("@/sanity/lib/client", () => ({ client: {} }));
vi.mock("@/sanity/lib/write-client", () => ({
  getWriteClient: () => ({}),
}));
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

import { receiptDocumentId, subscriptionDocumentId } from "@/lib/ops/push";

describe("push document ids", () => {
  it("builds deterministic subscription ids from endpoint", () => {
    const a = subscriptionDocumentId("https://push.example/sub-1");
    const b = subscriptionDocumentId("https://push.example/sub-1");
    const c = subscriptionDocumentId("https://push.example/sub-2");
    expect(a).toBe(b);
    expect(a).toMatch(/^opsPushSub\.[a-f0-9]{32}$/);
    expect(a).not.toBe(c);
  });

  it("builds deterministic receipt ids", () => {
    const input = {
      subscriptionId: "opsPushSub.abc",
      alertKey: "navidad",
      occurrenceDate: "2026-12-25",
      sentCivilDate: "2026-12-18",
    };
    expect(receiptDocumentId(input)).toBe(receiptDocumentId(input));
    expect(receiptDocumentId(input)).toMatch(/^opsPushReceipt\.[a-f0-9]{40}$/);
    expect(
      receiptDocumentId({ ...input, sentCivilDate: "2026-12-19" }),
    ).not.toBe(receiptDocumentId(input));
  });
});
