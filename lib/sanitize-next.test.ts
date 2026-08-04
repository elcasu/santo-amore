import { describe, expect, it } from "vitest";

import {
  sanitizeNext,
  sanitizeOpsNext,
  sanitizeSiteNext,
} from "@/lib/sanitize-next";

describe("sanitizeNext", () => {
  it("rejects absolute URLs and protocol-relative paths", () => {
    expect(
      sanitizeNext("https://evil.com", { fallback: "/" }),
    ).toBe("/");
    expect(sanitizeNext("//evil.com", { fallback: "/" })).toBe("/");
    expect(sanitizeNext(undefined, { fallback: "/" })).toBe("/");
  });

  it("applies allow predicate", () => {
    expect(
      sanitizeNext("/ops/pedidos", {
        fallback: "/ops",
        allow: (p) => p.startsWith("/ops"),
      }),
    ).toBe("/ops/pedidos");
    expect(
      sanitizeNext("/catalogo", {
        fallback: "/ops",
        allow: (p) => p.startsWith("/ops"),
      }),
    ).toBe("/ops");
  });
});

describe("sanitizeSiteNext", () => {
  it("allows store paths and blocks /acceso", () => {
    expect(sanitizeSiteNext("/catalogo")).toBe("/catalogo");
    expect(sanitizeSiteNext("/acceso")).toBe("/");
    expect(sanitizeSiteNext("/acceso?x=1")).toBe("/");
  });
});

describe("sanitizeOpsNext", () => {
  it("allows /ops subtree except login", () => {
    expect(sanitizeOpsNext("/ops/metricas")).toBe("/ops/metricas");
    expect(sanitizeOpsNext("/ops/login")).toBe("/ops");
    expect(sanitizeOpsNext("/catalogo")).toBe("/ops");
  });
});
