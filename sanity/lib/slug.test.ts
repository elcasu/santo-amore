import { describe, expect, it } from "vitest";

import { SLUG_MAX_LENGTH, toSlug } from "./slug";

describe("toSlug", () => {
  it("normalizes accents, case and spaces", () => {
    expect(toSlug("Brazalete Aurelia")).toBe("brazalete-aurelia");
    expect(toSlug("Colgante Véda")).toBe("colgante-veda");
  });

  it("strips leading/trailing separators", () => {
    expect(toSlug("  --Anillo Teiger--  ")).toBe("anillo-teiger");
  });

  it("caps length without leaving a trailing hyphen", () => {
    const long = `${"a".repeat(SLUG_MAX_LENGTH)}-extra`;
    const result = toSlug(long);
    expect(result.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(result.endsWith("-")).toBe(false);
  });
});
