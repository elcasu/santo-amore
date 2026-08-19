import { describe, expect, it } from "vitest";

import { resolveMercadoPagoWebhookAuth } from "@/lib/mercadopago/webhook-auth";

describe("resolveMercadoPagoWebhookAuth", () => {
  it("verifies when a secret is present, including production", () => {
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: "whsec",
        vercelEnv: "production",
      }),
    ).toEqual({ action: "verify", secret: "whsec" });
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: "  whsec  ",
        vercelEnv: undefined,
      }),
    ).toEqual({ action: "verify", secret: "whsec" });
  });

  it("rejects production without a secret", () => {
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: undefined,
        vercelEnv: "production",
      }),
    ).toEqual({ action: "reject_misconfigured" });
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: "   ",
        vercelEnv: "production",
      }),
    ).toEqual({ action: "reject_misconfigured" });
  });

  it("skips verification in local and preview when secret is missing", () => {
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: undefined,
        vercelEnv: undefined,
      }),
    ).toEqual({ action: "skip" });
    expect(
      resolveMercadoPagoWebhookAuth({
        secret: "",
        vercelEnv: "preview",
      }),
    ).toEqual({ action: "skip" });
  });
});
