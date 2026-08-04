import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data", () => ({
  getProductById: vi.fn(),
}));

import { getProductById } from "@/lib/data";
import { validateCheckoutCart } from "@/lib/checkout/validate-cart";
import type { Product } from "@/lib/types/content";

const getProductByIdMock = vi.mocked(getProductById);

function product(overrides: Partial<Product> = {}): Product {
  return {
    _id: "prod-1",
    title: "Collar",
    slug: "collar",
    price: 2000,
    commerceStatus: "available",
    trackInventory: true,
    stockQty: 5,
    maxPerOrder: 3,
    categories: [],
    ...overrides,
  } as Product;
}

describe("validateCheckoutCart", () => {
  beforeEach(() => {
    getProductByIdMock.mockReset();
  });

  it("rejects empty cart", async () => {
    await expect(validateCheckoutCart([])).resolves.toEqual({
      ok: false,
      error: "El carrito está vacío.",
    });
  });

  it("rejects invalid line qty", async () => {
    await expect(
      validateCheckoutCart([{ productId: "prod-1", qty: 0 }]),
    ).resolves.toMatchObject({ ok: false });
  });

  it("rejects missing product", async () => {
    getProductByIdMock.mockResolvedValueOnce(null);
    await expect(
      validateCheckoutCart([{ productId: "missing", qty: 1 }]),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("no encontrado"),
    });
  });

  it("rejects products that cannot be purchased", async () => {
    getProductByIdMock.mockResolvedValueOnce(
      product({ commerceStatus: "sold_out", stockQty: 0 }),
    );
    await expect(
      validateCheckoutCart([{ productId: "prod-1", qty: 1 }]),
    ).resolves.toMatchObject({ ok: false });
  });

  it("rejects qty above max", async () => {
    getProductByIdMock.mockResolvedValueOnce(product({ maxPerOrder: 2 }));
    await expect(
      validateCheckoutCart([{ productId: "prod-1", qty: 3 }]),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("máximo 2"),
    });
  });

  it("returns validated items and subtotal", async () => {
    getProductByIdMock.mockResolvedValueOnce(
      product({ unitCost: 500, sku: "SKU-1" }),
    );
    await expect(
      validateCheckoutCart([{ productId: "prod-1", qty: 2 }]),
    ).resolves.toEqual({
      ok: true,
      subtotal: 4000,
      items: [
        {
          productId: "prod-1",
          title: "Collar",
          slug: "collar",
          sku: "SKU-1",
          qty: 2,
          unitPrice: 2000,
          unitCost: 500,
        },
      ],
    });
  });
});
