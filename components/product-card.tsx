import Image from "next/image";
import Link from "next/link";

import { formatPriceArs } from "@/lib/data";
import type { Product } from "@/lib/types/content";

export function ProductCard({ product }: { product: Product }) {
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
            {formatPriceArs(product.price)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
