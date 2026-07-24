"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";

/** Vacía el carrito una vez al montar (retorno exitoso de MP). */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated) return;
    clear();
  }, [hydrated, clear]);

  return null;
}
