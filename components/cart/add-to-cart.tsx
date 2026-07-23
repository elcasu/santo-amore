"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { getMaxQty } from "@/lib/cart/limits";
import type { Product } from "@/lib/types/content";

type Props = {
  product: Pick<
    Product,
    | "_id"
    | "title"
    | "slug"
    | "price"
    | "mainImage"
    | "trackInventory"
    | "stockQty"
    | "maxPerOrder"
  >;
  ctaLabel: string;
};

export function AddToCart({ product, ctaLabel }: Props) {
  const { addItem, items } = useCart();
  const maxQty = getMaxQty(product);
  const inCart = items.find((item) => item.productId === product._id);
  const remaining = maxQty - (inCart?.qty ?? 0);
  const [qty, setQty] = useState(1);

  const price = product.price;
  const canAdd =
    typeof price === "number" && price >= 0 && remaining > 0 && maxQty >= 1;

  const effectiveQty = Math.min(qty, Math.max(1, remaining));

  function handleAdd() {
    if (!canAdd || typeof price !== "number") return;
    addItem({
      productId: product._id,
      qty: effectiveQty,
      title: product.title,
      slug: product.slug,
      price,
      image: product.mainImage?.src
        ? {
            src: product.mainImage.src,
            alt: product.mainImage.alt ?? product.title,
          }
        : undefined,
      maxQty,
    });
    setQty(1);
  }

  if (typeof price !== "number") {
    return (
      <p className="font-sans text-sm text-secondary">
        Precio no disponible para compra online.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <div className="inline-flex items-center border border-outline-variant/60 self-start">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          className="flex size-12 items-center justify-center font-sans text-base text-foreground transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="min-w-12 text-center font-sans text-base tabular-nums text-foreground">
          {Math.min(qty, Math.max(1, remaining || 1))}
        </span>
        <button
          type="button"
          onClick={() =>
            setQty((q) => Math.min(Math.max(1, remaining), q + 1))
          }
          disabled={!canAdd || qty >= remaining}
          className="flex size-12 items-center justify-center font-sans text-base text-foreground transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="inline-flex flex-1 items-center justify-center rounded bg-foreground px-8 py-4 font-display text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-secondary disabled:opacity-100 sm:flex-none sm:min-w-[220px]"
      >
        {remaining <= 0 ? "Máximo en carrito" : ctaLabel}
      </button>
    </div>
  );
}
