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

import { clampQty, mergeAdd } from "@/lib/cart/merge";
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
