import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { verifyMercadoPagoSignature } from "@/lib/mercadopago/verify-signature";

function sign(input: {
  dataId: string;
  requestId: string;
  ts: string;
  secret: string;
}): string {
  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${input.ts};`;
  const hash = createHmac("sha256", input.secret).update(manifest).digest("hex");
  return `ts=${input.ts},v1=${hash}`;
}

describe("verifyMercadoPagoSignature", () => {
  const secret = "test-webhook-secret";
  const dataId = "123456789";
  const requestId = "req-abc";
  const ts = "1700000000";

  it("accepts a valid signature", () => {
    const xSignature = sign({ dataId, requestId, ts, secret });
    expect(
      verifyMercadoPagoSignature({
        xSignature,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(true);
  });

  it("rejects missing inputs", () => {
    expect(
      verifyMercadoPagoSignature({
        xSignature: null,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(false);
    expect(
      verifyMercadoPagoSignature({
        xSignature: sign({ dataId, requestId, ts, secret }),
        xRequestId: null,
        dataId,
        secret,
      }),
    ).toBe(false);
    expect(
      verifyMercadoPagoSignature({
        xSignature: sign({ dataId, requestId, ts, secret }),
        xRequestId: requestId,
        dataId: undefined,
        secret,
      }),
    ).toBe(false);
  });

  it("rejects malformed x-signature", () => {
    expect(
      verifyMercadoPagoSignature({
        xSignature: "nope",
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(false);
  });

  it("rejects wrong hash or length mismatch", () => {
    expect(
      verifyMercadoPagoSignature({
        xSignature: `ts=${ts},v1=${"ab".repeat(32)}`,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(false);

    expect(
      verifyMercadoPagoSignature({
        xSignature: `ts=${ts},v1=short`,
        xRequestId: requestId,
        dataId,
        secret,
      }),
    ).toBe(false);
  });
});
