import { describe, expect, it } from "vitest";

import {
  buildCatalogHref,
  filterProductsByAvailability,
  getEffectiveCommerceStatus,
  getProductPurchaseState,
  parseAvailabilityFilter,
} from "@/lib/commerce";

describe("getEffectiveCommerceStatus", () => {
  it("defaults to available when status is missing", () => {
    expect(
      getEffectiveCommerceStatus({
        trackInventory: false,
      }),
    ).toBe("available");
  });

  it("marks available + tracked empty stock as sold_out", () => {
    expect(
      getEffectiveCommerceStatus({
        commerceStatus: "available",
        trackInventory: true,
        stockQty: 0,
      }),
    ).toBe("sold_out");
  });

  it("keeps available when inventory is not tracked", () => {
    expect(
      getEffectiveCommerceStatus({
        commerceStatus: "available",
        trackInventory: false,
        stockQty: 0,
      }),
    ).toBe("available");
  });

  it("does not override coming_soon even with zero stock", () => {
    expect(
      getEffectiveCommerceStatus({
        commerceStatus: "coming_soon",
        trackInventory: true,
        stockQty: 0,
      }),
    ).toBe("coming_soon");
  });
});

describe("getProductPurchaseState", () => {
  it("returns coming_soon state with custom label", () => {
    expect(
      getProductPurchaseState({
        commerceStatus: "coming_soon",
        trackInventory: false,
        comingSoonLabel: "Pronto",
      }),
    ).toMatchObject({
      status: "coming_soon",
      canPurchase: false,
      badgeLabel: "Pronto",
      ctaLabel: "Avisame",
    });
  });

  it("returns sold_out when stock is empty", () => {
    expect(
      getProductPurchaseState({
        commerceStatus: "available",
        trackInventory: true,
        stockQty: 0,
      }),
    ).toMatchObject({
      status: "sold_out",
      canPurchase: false,
      badgeLabel: "Agotado",
      ctaLabel: "Agotado",
    });
  });

  it("returns made_to_order with lead time hint", () => {
    expect(
      getProductPurchaseState({
        commerceStatus: "made_to_order",
        trackInventory: false,
        leadTimeDays: 10,
      }),
    ).toMatchObject({
      status: "made_to_order",
      canPurchase: true,
      badgeLabel: "Encargo",
      ctaLabel: "Agregar encargo",
      stockHint: "Elaboración estimada: 10 días",
    });
  });

  it("returns available with stock hint for last unit", () => {
    expect(
      getProductPurchaseState({
        commerceStatus: "available",
        trackInventory: true,
        stockQty: 1,
      }),
    ).toMatchObject({
      status: "available",
      canPurchase: true,
      badgeLabel: null,
      ctaLabel: "Agregar al carrito",
      stockHint: "Última unidad",
    });
  });

  it("returns available with plural stock hint", () => {
    expect(
      getProductPurchaseState({
        commerceStatus: "available",
        trackInventory: true,
        stockQty: 4,
      }),
    ).toMatchObject({
      stockHint: "4 disponibles",
    });
  });
});

describe("parseAvailabilityFilter", () => {
  it("accepts known filters and falls back to todas", () => {
    expect(parseAvailabilityFilter("listas")).toBe("listas");
    expect(parseAvailabilityFilter("encargo")).toBe("encargo");
    expect(parseAvailabilityFilter("proximamente")).toBe("proximamente");
    expect(parseAvailabilityFilter("todas")).toBe("todas");
    expect(parseAvailabilityFilter("otro")).toBe("todas");
    expect(parseAvailabilityFilter(undefined)).toBe("todas");
  });
});

describe("buildCatalogHref", () => {
  it("omits default disponibilidad", () => {
    expect(buildCatalogHref()).toBe("/catalogo");
    expect(buildCatalogHref({ disponibilidad: "todas" })).toBe("/catalogo");
  });

  it("keeps categoria and disponibilidad together", () => {
    expect(
      buildCatalogHref({
        categoria: "accesorios",
        disponibilidad: "encargo",
      }),
    ).toBe("/catalogo?categoria=accesorios&disponibilidad=encargo");
  });
});

describe("filterProductsByAvailability", () => {
  const products = [
    { commerceStatus: "available" as const, trackInventory: true, stockQty: 2 },
    { commerceStatus: "available" as const, trackInventory: true, stockQty: 0 },
    { commerceStatus: "made_to_order" as const, trackInventory: false },
    { commerceStatus: "coming_soon" as const, trackInventory: false },
  ];

  it("returns all products for todas", () => {
    expect(filterProductsByAvailability(products, "todas")).toHaveLength(4);
  });

  it("keeps only in-stock available items for listas", () => {
    expect(filterProductsByAvailability(products, "listas")).toEqual([
      products[0],
    ]);
  });

  it("filters encargos and próximamente", () => {
    expect(filterProductsByAvailability(products, "encargo")).toEqual([
      products[2],
    ]);
    expect(filterProductsByAvailability(products, "proximamente")).toEqual([
      products[3],
    ]);
  });
});
