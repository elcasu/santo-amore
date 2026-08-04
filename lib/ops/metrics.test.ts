import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/sanity/lib/client", () => ({ client: {} }));

import { resolveMetricsRange } from "@/lib/ops/metrics";

describe("resolveMetricsRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses explicit from/to when provided", () => {
    expect(
      resolveMetricsRange({ from: "2026-01-01", to: "2026-01-31" }),
    ).toEqual({ from: "2026-01-01", to: "2026-01-31" });
  });

  it("defaults to 30d ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T15:00:00.000Z"));

    expect(resolveMetricsRange({})).toEqual({
      from: "2026-07-06",
      to: "2026-08-04",
    });
  });

  it("supports 7d and 90d presets", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T15:00:00.000Z"));

    expect(resolveMetricsRange({ preset: "7d" })).toEqual({
      from: "2026-07-29",
      to: "2026-08-04",
    });
    expect(resolveMetricsRange({ preset: "90d" })).toEqual({
      from: "2026-05-07",
      to: "2026-08-04",
    });
  });
});
