"use client";

import Link from "next/link";
import { useEffect } from "react";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { useCart } from "@/components/cart/cart-provider";
import { formatPriceArs } from "@/lib/data";

export function CartDrawer() {
  const { items, itemCount, subtotal, hydrated, isDrawerOpen, closeDrawer } =
    useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!hydrated) return null;

  return (
    <div
      className={`fixed inset-0 z-60 ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isDrawerOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeDrawer}
        aria-label="Cerrar carrito"
      />

      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Carrito
            {itemCount > 0 ? (
              <span className="ml-2 font-sans text-sm font-normal text-secondary">
                ({itemCount})
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
          >
            Cerrar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="font-sans text-sm text-secondary">
                Tu carrito está vacío.
              </p>
              <Link
                href="/catalogo"
                onClick={closeDrawer}
                className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartLineItem key={item.productId} item={item} compact />
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-outline-variant/40 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-sans text-sm text-secondary">Subtotal</span>
              <span className="font-display text-lg font-semibold text-foreground">
                {formatPriceArs(subtotal)}
              </span>
            </div>
            <Link
              href="/carrito"
              onClick={closeDrawer}
              className="mb-3 flex w-full items-center justify-center border border-foreground px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground hover:text-white"
            >
              Ver carrito
            </Link>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex w-full items-center justify-center bg-foreground px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
