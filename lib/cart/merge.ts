import type { AddToCartInput, CartItem } from "@/lib/cart/types";

export function clampQty(qty: number, maxQty: number): number {
  return Math.max(1, Math.min(qty, maxQty));
}

export function mergeAdd(items: CartItem[], input: AddToCartInput): CartItem[] {
  const existing = items.find((item) => item.productId === input.productId);
  if (!existing) {
    return [
      ...items,
      {
        productId: input.productId,
        qty: clampQty(input.qty, input.maxQty),
        title: input.title,
        slug: input.slug,
        price: input.price,
        image: input.image,
        maxQty: input.maxQty,
      },
    ];
  }

  return items.map((item) => {
    if (item.productId !== input.productId) return item;
    const maxQty = input.maxQty;
    return {
      ...item,
      title: input.title,
      slug: input.slug,
      price: input.price,
      image: input.image ?? item.image,
      maxQty,
      qty: clampQty(item.qty + input.qty, maxQty),
    };
  });
}
