import { describe, expect, it } from "vitest";

import { clampQty, mergeAdd } from "@/lib/cart/merge";
import type { AddToCartInput, CartItem } from "@/lib/cart/types";

const baseInput: AddToCartInput = {
  productId: "p1",
  qty: 1,
  title: "Pulsera",
  slug: "pulsera",
  price: 1000,
  maxQty: 5,
};

describe("clampQty", () => {
  it("clamps below 1 up to 1", () => {
    expect(clampQty(0, 5)).toBe(1);
    expect(clampQty(-3, 5)).toBe(1);
  });

  it("clamps above maxQty", () => {
    expect(clampQty(9, 5)).toBe(5);
  });

  it("keeps values in range", () => {
    expect(clampQty(3, 5)).toBe(3);
  });
});

describe("mergeAdd", () => {
  it("appends a new line item", () => {
    const result = mergeAdd([], { ...baseInput, qty: 2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      productId: "p1",
      qty: 2,
      title: "Pulsera",
      maxQty: 5,
    });
  });

  it("merges qty for the same product and refreshes snapshot fields", () => {
    const existing: CartItem[] = [
      {
        productId: "p1",
        qty: 2,
        title: "Viejo",
        slug: "viejo",
        price: 900,
        maxQty: 3,
        image: { src: "/old.png" },
      },
    ];

    const result = mergeAdd(existing, {
      ...baseInput,
      qty: 2,
      title: "Nuevo",
      slug: "nuevo",
      price: 1100,
      maxQty: 5,
      image: { src: "/new.png", alt: "n" },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      qty: 4,
      title: "Nuevo",
      slug: "nuevo",
      price: 1100,
      maxQty: 5,
      image: { src: "/new.png", alt: "n" },
    });
  });

  it("keeps previous image when new input has none", () => {
    const existing: CartItem[] = [
      {
        ...baseInput,
        qty: 1,
        image: { src: "/keep.png" },
      },
    ];

    const result = mergeAdd(existing, { ...baseInput, qty: 1 });
    expect(result[0]?.image).toEqual({ src: "/keep.png" });
  });

  it("clamps merged qty to maxQty", () => {
    const existing: CartItem[] = [{ ...baseInput, qty: 4, maxQty: 5 }];
    const result = mergeAdd(existing, { ...baseInput, qty: 10, maxQty: 5 });
    expect(result[0]?.qty).toBe(5);
  });
});
