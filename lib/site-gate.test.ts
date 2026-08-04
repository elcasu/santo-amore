import { afterEach, describe, expect, it } from "vitest";

import {
  COOKIE_NAME,
  gateCookieOptions,
  hashGateToken,
  isSiteGateEnabled,
  isValidGateCookie,
} from "@/lib/site-gate";

describe("site-gate", () => {
  afterEach(() => {
    delete process.env.SITE_PASSWORD;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
  });

  it("enables gate only with password outside Vercel production", () => {
    expect(isSiteGateEnabled()).toBe(false);
    process.env.SITE_PASSWORD = "secret";
    expect(isSiteGateEnabled()).toBe(true);
    process.env.VERCEL_ENV = "production";
    expect(isSiteGateEnabled()).toBe(false);
  });

  it("hashes tokens deterministically and validates cookies", async () => {
    process.env.SITE_PASSWORD = "secret";
    const token = await hashGateToken("secret");
    expect(token).toHaveLength(64);
    expect(await isValidGateCookie(token)).toBe(true);
    expect(await isValidGateCookie("nope")).toBe(false);
    expect(await isValidGateCookie(undefined)).toBe(false);
  });

  it("sets cookie options", () => {
    process.env.VERCEL = "1";
    expect(gateCookieOptions(100)).toMatchObject({
      name: COOKIE_NAME,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 100,
    });
  });
});
