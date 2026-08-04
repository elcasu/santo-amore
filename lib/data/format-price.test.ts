import { afterEach, describe, expect, it } from "vitest";

import { formatPriceArs, isUsingMocks } from "@/lib/data";

describe("formatPriceArs", () => {
  it("formats ARS without decimals", () => {
    const formatted = formatPriceArs(12500);
    expect(formatted).toContain("12");
    expect(formatted).toContain("500");
    expect(formatted).toMatch(/\$|ARS/);
  });

  it("returns empty string for non-numbers", () => {
    expect(formatPriceArs(undefined)).toBe("");
  });
});

describe("isUsingMocks", () => {
  afterEach(() => {
    delete process.env.USE_SANITY_MOCKS;
    delete process.env.NEXT_PUBLIC_USE_SANITY_MOCKS;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  });

  it("honors explicit true/false flags", () => {
    process.env.USE_SANITY_MOCKS = "true";
    expect(isUsingMocks()).toBe(true);

    process.env.USE_SANITY_MOCKS = "false";
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc";
    expect(isUsingMocks()).toBe(false);
  });

  it("defaults to mocks when project id is missing", () => {
    delete process.env.USE_SANITY_MOCKS;
    delete process.env.NEXT_PUBLIC_USE_SANITY_MOCKS;
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    expect(isUsingMocks()).toBe(true);
  });
});
