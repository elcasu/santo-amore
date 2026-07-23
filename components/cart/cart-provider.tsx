"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { cartItemCount, cartSubtotal } from "@/lib/cart/storage";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  setCartState,
  subscribeCart,
} from "@/lib/cart/store";
import type { AddToCartInput, CartItem } from "@/lib/cart/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (input: AddToCartInput) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(qty: number, maxQty: number): number {
  return Math.max(1, Math.min(qty, maxQty));
}

function mergeAdd(items: CartItem[], input: AddToCartInput): CartItem[] {
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

/** Client-only flag without useEffect setState (avoids cascading-render lint). */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const hydrated = useHydrated();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(
    () => setIsDrawerOpen((open) => !open),
    [],
  );

  const addItem = useCallback((input: AddToCartInput) => {
    setCartState((prev) => ({ items: mergeAdd(prev.items, input) }));
    setIsDrawerOpen(true);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setCartState((prev) => ({
      items: prev.items
        .map((item) => {
          if (item.productId !== productId) return item;
          if (qty < 1) return item;
          return { ...item, qty: clampQty(qty, item.maxQty) };
        })
        .filter((item) => item.qty >= 1),
    }));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartState((prev) => ({
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  }, []);

  const clear = useCallback(() => {
    setCartState({ items: [] });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: cartItemCount(state.items),
      subtotal: cartSubtotal(state.items),
      hydrated,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      setQty,
      removeItem,
      clear,
    }),
    [
      state.items,
      hydrated,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      setQty,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
