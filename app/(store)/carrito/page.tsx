"use client";

import Link from "next/link";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { useCart } from "@/components/cart/cart-provider";
import { formatPriceArs } from "@/lib/data";

export default function CarritoPage() {
  const { items, itemCount, subtotal, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[960px] px-5 py-16 md:px-16">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Carrito
        </h1>
        <p className="font-sans text-sm text-secondary">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] px-5 py-16 md:px-16">
      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Carrito
      </h1>
      {itemCount > 0 ? (
        <p className="mb-10 font-sans text-sm text-secondary">
          {itemCount} {itemCount === 1 ? "pieza" : "piezas"}
        </p>
      ) : (
        <div className="mb-10" />
      )}

      {items.length === 0 ? (
        <div className="border border-outline-variant/40 bg-surface-container/40 px-6 py-16 text-center">
          <p className="mb-6 font-sans text-base text-secondary">
            Tu carrito está vacío.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center bg-foreground px-8 py-3 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          <div>
            {items.map((item) => (
              <CartLineItem key={item.productId} item={item} />
            ))}
          </div>

          <aside className="h-fit border border-outline-variant/40 bg-surface-container/40 p-6 lg:sticky lg:top-28">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Resumen
            </h2>
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/40 pb-4">
              <span className="font-sans text-sm text-secondary">Subtotal</span>
              <span className="font-display text-xl font-semibold text-foreground">
                {formatPriceArs(subtotal)}
              </span>
            </div>
            <button
              type="button"
              disabled
              className="mb-3 flex w-full cursor-not-allowed items-center justify-center bg-surface-container-high px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-secondary"
            >
              Checkout · Próximamente
            </button>
            <Link
              href="/catalogo"
              className="flex w-full items-center justify-center font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary"
            >
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
