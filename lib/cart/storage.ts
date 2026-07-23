import type { CartItem, CartState } from "@/lib/cart/types";

export const CART_STORAGE_KEY = "sa_cart_v1";

const emptyState: CartState = { items: [] };

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.qty === "number" &&
    typeof item.title === "string" &&
    typeof item.slug === "string" &&
    typeof item.price === "number" &&
    typeof item.maxQty === "number"
  );
}

export function parseCartState(raw: string | null): CartState {
  if (!raw) return emptyState;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyState;
    const items = (parsed as { items?: unknown }).items;
    if (!Array.isArray(items)) return emptyState;
    return {
      items: items.filter(isCartItem).map((item) => ({
        ...item,
        qty: Math.max(1, Math.min(item.qty, item.maxQty)),
        image:
          item.image &&
          typeof item.image === "object" &&
          typeof (item.image as { src?: unknown }).src === "string"
            ? {
                src: (item.image as { src: string }).src,
                alt:
                  typeof (item.image as { alt?: unknown }).alt === "string"
                    ? (item.image as { alt: string }).alt
                    : undefined,
              }
            : undefined,
      })),
    };
  } catch {
    return emptyState;
  }
}

export function readCartState(): CartState {
  if (typeof window === "undefined") return emptyState;
  try {
    return parseCartState(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return emptyState;
  }
}

export function writeCartState(state: CartState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — ignore
  }
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
