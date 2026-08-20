import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { WhatsAppContactCta } from "@/components/whatsapp-contact-cta";
import { getProductPurchaseState } from "@/lib/commerce";
import {
  formatPriceArs,
  getProductBySlug,
  getProducts,
} from "@/lib/data";
import type { PortableTextBlock } from "@/lib/types/content";
import { buildWhatsAppUrl, productWhatsAppText } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const purchase = getProductPurchaseState(product);
  const related = (await getProducts())
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);
  const galleryImages = (product.images ?? []).filter((img) => img?.src);
  const whatsappHref = buildWhatsAppUrl({
    text: productWhatsAppText(product.title, purchase.status),
  });

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-sm bg-surface-container">
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
            {purchase.badgeLabel ? (
              <span className="absolute left-4 top-4 rounded-sm bg-background/90 px-3 py-1.5 font-sans text-[11px] text-foreground">
                {purchase.badgeLabel}
              </span>
            ) : null}
          </div>
          {galleryImages.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryImages.slice(0, 3).map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-square overflow-hidden rounded-sm bg-surface-container"
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
            <p className="mb-3 font-sans text-sm text-secondary">
              {product.collectionLabel}
            </p>
          ) : null}
          <h1 className="mb-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {product.title}
          </h1>
          {typeof product.price === "number" ? (
            <p
              className={`font-sans text-xl text-foreground ${purchase.stockHint ? "mb-2" : "mb-6"}`}
            >
              {typeof product.compareAtPrice === "number" ? (
                <>
                  <span className="mr-3 text-base text-secondary line-through">
                    {formatPriceArs(product.compareAtPrice)}
                  </span>
                  {formatPriceArs(product.price)}
                </>
              ) : (
                formatPriceArs(product.price)
              )}
            </p>
          ) : null}
          {purchase.stockHint ? (
            <p className="mb-6 font-sans text-sm text-secondary">
              {purchase.stockHint}
            </p>
          ) : null}
          {product.description ? (
            <p className="mb-8 max-w-lg font-sans text-base leading-relaxed text-secondary">
              {product.description}
            </p>
          ) : null}

          {purchase.status === "made_to_order" ? (
            <p className="mb-6 max-w-lg font-sans text-sm leading-relaxed text-secondary">
              Esta pieza se elabora a pedido. El tiempo estimado es una guía del
              taller; si preferís coordinar, escribinos.
            </p>
          ) : null}

          {purchase.canPurchase ? (
            <AddToCart product={product} ctaLabel={purchase.ctaLabel} />
          ) : purchase.status === "coming_soon" ? (
            <p className="font-sans text-sm text-secondary">
              Todavía no está a la venta. Dejanos tu consulta y te avisamos.
            </p>
          ) : (
            <p className="font-sans text-sm text-secondary">
              No hay unidades ahora. Si te interesa, consultanos.
            </p>
          )}

          {whatsappHref ? (
            <WhatsAppContactCta
              text={productWhatsAppText(product.title, purchase.status)}
              label={
                purchase.status === "made_to_order"
                  ? "Encargar por WhatsApp"
                  : purchase.status === "coming_soon"
                    ? "Avisame por WhatsApp"
                    : purchase.status === "sold_out"
                      ? "Consultar por WhatsApp"
                      : "Consultar por WhatsApp"
              }
              variant="secondary"
              className="mt-4"
            />
          ) : purchase.canPurchase ? null : (
            <Link
              href="/contacto"
              className="mt-4 inline-flex w-full items-center justify-center rounded-sm border border-foreground/20 px-8 py-3.5 font-display text-lg font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:w-auto"
            >
              {purchase.status === "coming_soon" ? "Avisame" : "Contacto"}
            </Link>
          )}

          {product.body?.length ? (
            <div className="mt-12 space-y-4 border-t border-outline-variant/40 pt-10">
              <h2 className="font-display text-2xl font-medium">El oficio</h2>
              {product.body.map((block) => (
                <PortableParagraph key={block._key} block={block} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="mt-24 border-t border-outline-variant/40 pt-16">
          <h2 className="mb-2 font-display text-2xl font-medium">
            Otras piezas
          </h2>
          <p className="mb-10 font-sans text-secondary">
            Del mismo atelier, para mirar junto a esta.
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
