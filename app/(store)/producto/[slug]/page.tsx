import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import {
  formatPriceArs,
  getProductBySlug,
  getProducts,
} from "@/lib/data";
import type { PortableTextBlock } from "@/lib/types/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts())
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container">
            {product.mainImage?.src ? (
              <Image
                src={product.mainImage.src}
                alt={product.mainImage.alt ?? product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
          </div>
          {product.images && product.images.length > 1 ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.images.slice(0, 3).map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-square overflow-hidden rounded-lg bg-surface-container"
                >
                  <Image
                    src={img.src}
                    alt={img.alt ?? product.title}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          {product.collectionLabel ? (
            <p className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
              {product.collectionLabel}
            </p>
          ) : null}
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {product.title}
          </h1>
          {typeof product.price === "number" ? (
            <p className="mb-6 font-sans text-xl text-foreground">
              {formatPriceArs(product.price)}
            </p>
          ) : null}
          {product.description ? (
            <p className="mb-8 max-w-lg font-sans text-base leading-relaxed text-secondary">
              {product.description}
            </p>
          ) : null}

          <div className="mb-6 rounded-lg border border-outline-variant/50 bg-surface-container/60 p-4 text-sm text-secondary">
            Compra online en fase 3. Por ahora consultá disponibilidad por{" "}
            <Link href="/contacto" className="text-primary underline">
              contacto
            </Link>
            .
          </div>

          <Link
            href="/contacto"
            className="inline-flex w-full items-center justify-center rounded bg-foreground px-8 py-4 font-display text-lg font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            Consultar pieza
          </Link>

          {product.body?.length ? (
            <div className="mt-12 space-y-4 border-t border-outline-variant/40 pt-10">
              <h2 className="font-display text-2xl font-semibold">
                The Craftsmanship
              </h2>
              {product.body.map((block) => (
                <PortableParagraph key={block._key} block={block} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-24 border-t border-outline-variant/40 pt-16">
          <h2 className="mb-2 font-display text-2xl font-semibold">
            Related Treasures
          </h2>
          <p className="mb-10 font-sans text-secondary">
            Otras piezas para acompañar tu colección.
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PortableParagraph({ block }: { block: PortableTextBlock }) {
  const text = block.children.map((c) => c.text).join("");
  return <p className="font-sans leading-relaxed text-secondary">{text}</p>;
}
