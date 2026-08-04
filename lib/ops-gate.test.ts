import { afterEach, describe, expect, it } from "vitest";

import {
  OPS_COOKIE_NAME,
  hashOpsToken,
  isOpsGateEnabled,
  isValidOpsCookie,
  opsCookieOptions,
} from "@/lib/ops-gate";

describe("ops-gate", () => {
  afterEach(() => {
    delete process.env.OPS_PASSWORD;
    delete process.env.VERCEL;
  });

  it("enables when OPS_PASSWORD is set", () => {
    expect(isOpsGateEnabled()).toBe(false);
    process.env.OPS_PASSWORD = "ops-secret";
    expect(isOpsGateEnabled()).toBe(true);
  });

  it("hashes and validates ops cookies", async () => {
    process.env.OPS_PASSWORD = "ops-secret";
    const token = await hashOpsToken("ops-secret");
    expect(await isValidOpsCookie(token)).toBe(true);
    expect(await isValidOpsCookie("wrong")).toBe(false);
  });

  it("exposes cookie options for /api/ops coverage", () => {
    expect(opsCookieOptions()).toMatchObject({
      name: OPS_COOKIE_NAME,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  });
});
