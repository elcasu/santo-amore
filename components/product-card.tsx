import Image from "next/image";
import Link from "next/link";

import { getProductPurchaseState } from "@/lib/commerce";
import { formatPriceArs } from "@/lib/data";
import type { Product } from "@/lib/types/content";

export function ProductCard({ product }: { product: Product }) {
  const purchase = getProductPurchaseState(product);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden rounded bg-surface-container">
        {product.mainImage?.src ? (
          <Image
            src={product.mainImage.src}
            alt={product.mainImage.alt ?? product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        {purchase.badgeLabel ? (
          <span className="absolute left-3 top-3 rounded bg-foreground/90 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            {purchase.badgeLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-4 space-y-1">
        {product.collectionLabel ? (
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {product.collectionLabel}
          </p>
        ) : null}
        <h3 className="font-display text-lg font-semibold text-foreground">
          {product.title}
        </h3>
        {typeof product.price === "number" ? (
          <p className="font-sans text-sm text-secondary">
            {typeof product.compareAtPrice === "number" ? (
              <>
                <span className="mr-2 text-secondary/60 line-through">
                  {formatPriceArs(product.compareAtPrice)}
                </span>
                <span className="text-foreground">
                  {formatPriceArs(product.price)}
                </span>
              </>
            ) : (
              formatPriceArs(product.price)
            )}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
