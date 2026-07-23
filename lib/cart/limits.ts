import type { Product } from "@/lib/types/content";

const DEFAULT_MAX = 99;

type ProductLimits = Pick<
  Product,
  "trackInventory" | "stockQty" | "maxPerOrder"
>;

/** Upper bound for qty in cart for a product (stock ∩ maxPerOrder). */
export function getMaxQty(product: ProductLimits): number {
  const caps: number[] = [];

  if (typeof product.maxPerOrder === "number" && product.maxPerOrder > 0) {
    caps.push(product.maxPerOrder);
  }

  if (
    product.trackInventory &&
    typeof product.stockQty === "number" &&
    product.stockQty >= 0
  ) {
    caps.push(product.stockQty);
  }

  if (caps.length === 0) return DEFAULT_MAX;
  return Math.max(1, Math.min(...caps));
}
