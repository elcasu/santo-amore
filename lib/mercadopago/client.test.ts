import { afterEach, describe, expect, it } from "vitest";

import { getSiteUrl } from "@/lib/mercadopago/client";

describe("getSiteUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  it("strips trailing slash from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://santoamore.com.ar/";
    expect(getSiteUrl()).toBe("https://santoamore.com.ar");
  });

  it("prefixes https for host-only Vercel URLs", () => {
    process.env.VERCEL_URL = "santo-amore.vercel.app";
    expect(getSiteUrl()).toBe("https://santo-amore.vercel.app");
  });

  it("throws when no URL is configured", () => {
    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
