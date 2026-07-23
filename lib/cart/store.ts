import {
  readCartState,
  writeCartState,
} from "@/lib/cart/storage";
import type { CartState } from "@/lib/cart/types";

const emptyState: CartState = { items: [] };

let memoryState: CartState = emptyState;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  memoryState = readCartState();
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getCartSnapshot(): CartState {
  return memoryState;
}

export function getCartServerSnapshot(): CartState {
  return emptyState;
}

export function subscribeCart(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function setCartState(
  next: CartState | ((prev: CartState) => CartState),
): void {
  const resolved = typeof next === "function" ? next(memoryState) : next;
  memoryState = resolved;
  writeCartState(memoryState);
  emit();
}
