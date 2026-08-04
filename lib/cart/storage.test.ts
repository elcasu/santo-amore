import { describe, expect, it } from "vitest";

import {
  cartItemCount,
  cartSubtotal,
  parseCartState,
} from "@/lib/cart/storage";
import type { CartItem } from "@/lib/cart/types";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  qty: 2,
  title: "A",
  slug: "a",
  price: 1000,
  maxQty: 5,
  ...overrides,
});

describe("parseCartState", () => {
  it("returns empty state for null/invalid JSON", () => {
    expect(parseCartState(null)).toEqual({ items: [] });
    expect(parseCartState("not-json")).toEqual({ items: [] });
    expect(parseCartState("{}")).toEqual({ items: [] });
  });

  it("keeps valid items and clamps qty", () => {
    const raw = JSON.stringify({
      items: [
        {
          productId: "p1",
          qty: 99,
          title: "A",
          slug: "a",
          price: 1000,
          maxQty: 3,
          image: { src: "/x.png", alt: "x" },
        },
        { productId: 1, qty: 1 },
      ],
    });

    const state = parseCartState(raw);
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({
      productId: "p1",
      qty: 3,
      image: { src: "/x.png", alt: "x" },
    });
  });

  it("drops image without string src", () => {
    const raw = JSON.stringify({
      items: [
        {
          productId: "p1",
          qty: 1,
          title: "A",
          slug: "a",
          price: 1000,
          maxQty: 3,
          image: { alt: "no-src" },
        },
      ],
    });
    expect(parseCartState(raw).items[0]?.image).toBeUndefined();
  });
});

describe("cart aggregates", () => {
  it("sums item count and subtotal", () => {
    const items = [
      item({ qty: 2, price: 1000 }),
      item({ productId: "p2", qty: 1, price: 500 }),
    ];
    expect(cartItemCount(items)).toBe(3);
    expect(cartSubtotal(items)).toBe(2500);
  });

  it("returns zero for empty cart", () => {
    expect(cartItemCount([])).toBe(0);
    expect(cartSubtotal([])).toBe(0);
  });
});
