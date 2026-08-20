import { describe, expect, it } from "vitest";

import {
  cellTransform,
  clamp,
  idleAttractor,
  layoutFieldCells,
  lerp,
  magneticOffset,
  mixHex,
  proximityT,
  shouldAnimatePointerMotion,
} from "./proximity";

describe("clamp / lerp", () => {
  it("clamps to the range", () => {
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
    expect(clamp(3, 0, 1)).toBe(1);
  });

  it("interpolates linearly", () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe("proximityT", () => {
  it("is 1 at the pointer and 0 at/beyond the radius", () => {
    expect(proximityT(0, 100)).toBe(1);
    expect(proximityT(100, 100)).toBe(0);
    expect(proximityT(140, 100)).toBe(0);
  });

  it("falls off inside the radius", () => {
    const mid = proximityT(50, 100);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(proximityT(20, 100)).toBeGreaterThan(mid);
  });

  it("returns 0 when radius is invalid", () => {
    expect(proximityT(0, 0)).toBe(0);
    expect(proximityT(10, -4)).toBe(0);
  });
});

describe("cellTransform", () => {
  const rest = { scale: 1, alpha: 0.2 };
  const peak = { scale: 3, alpha: 0.9 };

  it("returns rest at t=0 and peak at t=1", () => {
    expect(cellTransform(0, rest, peak)).toEqual(rest);
    const peaked = cellTransform(1, rest, peak);
    expect(peaked.scale).toBeCloseTo(peak.scale);
    expect(peaked.alpha).toBeCloseTo(peak.alpha);
  });
});

describe("magneticOffset", () => {
  it("pulls toward the pointer and is zero at the center", () => {
    expect(magneticOffset(0, 0, 80, 12)).toEqual({ x: 0, y: 0 });
    const right = magneticOffset(40, 0, 80, 12);
    expect(right.x).toBeGreaterThan(0);
    expect(right.y).toBe(0);
    expect(right.x).toBeLessThanOrEqual(12);
  });

  it("is zero outside the radius", () => {
    expect(magneticOffset(200, 0, 80, 12)).toEqual({ x: 0, y: 0 });
  });
});

describe("shouldAnimatePointerMotion", () => {
  it("requires a fine pointer and no reduced-motion", () => {
    expect(
      shouldAnimatePointerMotion({
        prefersReducedMotion: false,
        hasFinePointer: true,
      }),
    ).toBe(true);
    expect(
      shouldAnimatePointerMotion({
        prefersReducedMotion: true,
        hasFinePointer: true,
      }),
    ).toBe(false);
    expect(
      shouldAnimatePointerMotion({
        prefersReducedMotion: false,
        hasFinePointer: false,
      }),
    ).toBe(false);
  });
});

describe("layoutFieldCells", () => {
  it("centers a regular grid inside the bounds", () => {
    const cells = layoutFieldCells({ width: 100, height: 100, gap: 50 });
    const xs = [...new Set(cells.map((c) => c.x))].sort((a, b) => a - b);
    const ys = [...new Set(cells.map((c) => c.y))].sort((a, b) => a - b);
    expect(cells.length).toBeGreaterThan(0);
    expect(xs[0]).toBeGreaterThanOrEqual(0);
    expect(xs.at(-1)).toBeLessThanOrEqual(100);
    expect(ys[0]).toBeGreaterThanOrEqual(0);
    expect(ys.at(-1)).toBeLessThanOrEqual(100);
  });

  it("uses a single cell when the area is smaller than the gap", () => {
    const cells = layoutFieldCells({
      width: 20,
      height: 20,
      gap: 40,
      padding: 0,
    });
    expect(cells).toEqual([{ x: 10, y: 10 }]);
  });
});

describe("idleAttractor / mixHex", () => {
  it("keeps the idle path inside the field", () => {
    const p = idleAttractor(0, 400, 300);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(400);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(300);
  });

  it("mixes hex colors", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});
