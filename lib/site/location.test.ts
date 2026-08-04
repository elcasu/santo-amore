import { describe, expect, it } from "vitest";

import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LOCATION_LABEL,
  flagEmojiFromCountryCode,
  resolveCountryCode,
  resolveLocationLabel,
} from "@/lib/site/location";

describe("resolveLocationLabel", () => {
  it("returns trimmed CMS value", () => {
    expect(resolveLocationLabel("  Mar del Plata, Argentina  ")).toBe(
      "Mar del Plata, Argentina",
    );
  });

  it("falls back when empty or missing", () => {
    expect(resolveLocationLabel(undefined)).toBe(DEFAULT_LOCATION_LABEL);
    expect(resolveLocationLabel(null)).toBe(DEFAULT_LOCATION_LABEL);
    expect(resolveLocationLabel("")).toBe(DEFAULT_LOCATION_LABEL);
    expect(resolveLocationLabel("   ")).toBe(DEFAULT_LOCATION_LABEL);
  });
});

describe("resolveCountryCode", () => {
  it("normalizes valid codes", () => {
    expect(resolveCountryCode("ar")).toBe("AR");
    expect(resolveCountryCode(" AR ")).toBe("AR");
  });

  it("falls back when invalid", () => {
    expect(resolveCountryCode(undefined)).toBe(DEFAULT_COUNTRY_CODE);
    expect(resolveCountryCode("")).toBe(DEFAULT_COUNTRY_CODE);
    expect(resolveCountryCode("ARG")).toBe(DEFAULT_COUNTRY_CODE);
    expect(resolveCountryCode("1A")).toBe(DEFAULT_COUNTRY_CODE);
  });
});

describe("flagEmojiFromCountryCode", () => {
  it("builds Argentina flag emoji", () => {
    expect(flagEmojiFromCountryCode("AR")).toBe("🇦🇷");
  });
});
