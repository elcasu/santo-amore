"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { formatPriceArs } from "@/lib/data";
import type { CartItem } from "@/lib/cart/types";

type Props = {
  item: CartItem;
  compact?: boolean;
};

export function CartLineItem({ item, compact = false }: Props) {
  const { setQty, removeItem } = useCart();
  const atMax = item.qty >= item.maxQty;

  return (
    <div
      className={`flex gap-4 border-b border-outline-variant/40 ${compact ? "py-4" : "py-6"}`}
    >
      <Link
        href={`/producto/${item.slug}`}
        className={`relative shrink-0 overflow-hidden rounded bg-surface-container ${compact ? "size-16" : "size-24"}`}
      >
        {item.image?.src ? (
          <Image
            src={item.image.src}
            alt={item.image.alt ?? item.title}
            fill
            className="object-cover"
            sizes={compact ? "64px" : "96px"}
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/producto/${item.slug}`}
              className={`font-display font-semibold text-foreground transition-colors hover:text-primary ${compact ? "text-sm" : "text-base"}`}
            >
              {item.title}
            </Link>
            <p className="mt-1 font-sans text-sm text-secondary">
              {formatPriceArs(item.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="shrink-0 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
            aria-label={`Quitar ${item.title}`}
          >
            Quitar
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-outline-variant/60">
            <button
              type="button"
              onClick={() => setQty(item.productId, item.qty - 1)}
              disabled={item.qty <= 1}
              className="flex size-8 items-center justify-center font-sans text-sm text-foreground transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="min-w-8 text-center font-sans text-sm tabular-nums text-foreground">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(item.productId, item.qty + 1)}
              disabled={atMax}
              className="flex size-8 items-center justify-center font-sans text-sm text-foreground transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          <p className="font-sans text-sm font-medium text-foreground">
            {formatPriceArs(item.price * item.qty)}
          </p>
        </div>
      </div>
    </div>
  );
}
