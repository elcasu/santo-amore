import Image from "next/image";
import Link from "next/link";

import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product-card";
import { WhatsAppContactCta } from "@/components/whatsapp-contact-cta";
import {
  buildCatalogHref,
  getEffectiveCommerceStatus,
  getProductPurchaseState,
} from "@/lib/commerce";
import { getHomePage, getProducts, getSiteSettings } from "@/lib/data";

export default async function HomePage() {
  const [{ home, source }, { settings }, products] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getProducts(),
  ]);
  const { hero, collections, journal, featuredProducts } = home;
  const drops = collections?.drops ?? [];
  const featured = featuredProducts?.products?.slice(0, 3) ?? [];
  const ready = products.filter(
    (product) => getEffectiveCommerceStatus(product) === "available",
  );
  const madeToOrder = products.filter(
    (product) => getEffectiveCommerceStatus(product) === "made_to_order",
  );

  return (
    <>
      {source === "sanity-fallback" || source === "mock" ? (
        <div className="relative z-30 border-b border-amber-700/30 bg-amber-50 px-5 py-3 text-center font-sans text-sm text-amber-950 md:px-16">
          {source === "mock" ? (
            <>
              Estás viendo <strong>mocks</strong>. Para Sanity: poné{" "}
              <code className="rounded bg-amber-100 px-1">
                USE_SANITY_MOCKS=false
              </code>{" "}
              en <code className="rounded bg-amber-100 px-1">.env</code> y
              reiniciá{" "}
              <code className="rounded bg-amber-100 px-1">yarn dev</code>.
            </>
          ) : (
            <>
              Sanity no tiene una <strong>Home</strong> publicada todavía. Estás
              viendo el mock. Abrí{" "}
              <Link href="/studio" className="underline">
                /studio → Home
              </Link>
              , completá las secciones y hacé <strong>Publish</strong>.
            </>
          )}
        </div>
      ) : null}

      <section className="relative flex min-h-[calc(100svh-88px)] flex-col justify-end overflow-hidden sm:min-h-[calc(100svh-64px)] md:min-h-[calc(100svh-72px)] lg:mx-auto lg:grid lg:min-h-0 lg:w-full lg:max-w-[1280px] lg:grid-cols-2 lg:items-center lg:justify-normal lg:gap-20 lg:overflow-visible lg:px-16 lg:py-24">
        {hero.backgroundImage?.src ? (
          <div className="absolute inset-0 lg:hidden">
            <Image
              src={hero.backgroundImage.src}
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-background via-background/88 to-background/45"
            />
          </div>
        ) : null}

        <div className="relative z-10 px-5 pb-12 pt-16 md:px-16 lg:px-0 lg:py-0">
          {hero.eyebrow ? (
            <span className="mb-5 block animate-fade-rise font-sans text-sm text-secondary">
              {hero.eyebrow}
            </span>
          ) : null}
          <h1 className="mb-6 animate-fade-rise font-display text-[40px] font-medium leading-[1.15] text-foreground [animation-delay:60ms] md:text-[56px]">
            {hero.title}
            {hero.titleHighlight ? (
              <>
                {" "}
                <span className="text-primary">{hero.titleHighlight}</span>
              </>
            ) : null}
          </h1>
          {hero.subtitle ? (
            <p className="mb-10 max-w-xl animate-fade-rise font-sans text-lg leading-relaxed text-secondary [animation-delay:120ms]">
              {hero.subtitle}
            </p>
          ) : null}
          <div className="flex animate-fade-rise flex-wrap gap-4 [animation-delay:200ms]">
            {hero.primaryCta ? (
              <Magnetic className="inline-flex" maxPull={6}>
                <Link
                  href={hero.primaryCta.href}
                  className="rounded-sm bg-primary px-7 py-3.5 font-display text-lg font-medium text-on-primary shadow-sm transition-colors duration-300 hover:bg-primary-container"
                >
                  {hero.primaryCta.label}
                </Link>
              </Magnetic>
            ) : null}
            {hero.secondaryCta ? (
              <Magnetic className="inline-flex" maxPull={6}>
                <Link
                  href={hero.secondaryCta.href}
                  className="rounded-sm border border-foreground/20 bg-background/90 px-7 py-3.5 font-display text-lg font-medium text-foreground backdrop-blur-sm transition-colors duration-300 hover:border-primary hover:text-primary lg:bg-transparent lg:backdrop-blur-none"
                >
                  {hero.secondaryCta.label}
                </Link>
              </Magnetic>
            ) : null}
          </div>
        </div>

        <div className="relative hidden aspect-4/5 overflow-hidden rounded-sm bg-surface-container lg:block">
          {hero.backgroundImage?.src ? (
            <Image
              src={hero.backgroundImage.src}
              alt={hero.backgroundImage.alt || "Pieza Santo Amore"}
              fill
              className="object-cover"
              sizes="50vw"
            />
          ) : null}
        </div>
      </section>

      <section className="border-y border-outline-variant/40 bg-surface-container/60 py-20">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <Reveal className="mb-10 max-w-2xl">
            <h2 className="mb-3 font-display text-3xl font-medium text-foreground md:text-[32px]">
              Cómo llevártelo
            </h2>
            <p className="font-sans text-base text-secondary">
              Algunas piezas están listas. Otras se hacen a pedido en el taller.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <PathCard
              href={buildCatalogHref({ disponibilidad: "listas" })}
              title="Listo para llevar"
              body="Stock en el atelier, para ahora."
              countLabel={
                ready.length
                  ? `${ready.length} ${ready.length === 1 ? "pieza" : "piezas"}`
                  : "Ver piezas"
              }
              imageSrc={ready[0]?.mainImage?.src}
              imageAlt={ready[0]?.mainImage?.alt ?? ready[0]?.title}
              delayMs={0}
            />
            <PathCard
              href={buildCatalogHref({ disponibilidad: "encargo" })}
              title="Hecho a pedido"
              body="Encargos con tiempo de elaboración."
              countLabel={
                madeToOrder.length
                  ? `${madeToOrder.length} ${madeToOrder.length === 1 ? "encargo" : "encargos"}`
                  : "Ver encargos"
              }
              imageSrc={madeToOrder[0]?.mainImage?.src}
              imageAlt={madeToOrder[0]?.mainImage?.alt ?? madeToOrder[0]?.title}
              delayMs={80}
            />
          </div>
        </div>
      </section>

      {featured.length ? (
        <section className="bg-background py-24">
          <div className="mx-auto max-w-[1280px] px-5 md:px-16">
            <Reveal className="mb-12 flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-medium text-foreground md:text-[32px]">
                {featuredProducts?.title ?? "Piezas"}
              </h2>
              {featuredProducts?.viewAllCta ? (
                <Link
                  href={featuredProducts.viewAllCta.href}
                  className="font-sans text-sm text-primary transition-colors hover:text-primary-container"
                >
                  {featuredProducts.viewAllCta.label}
                </Link>
              ) : null}
            </Reveal>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product, index) => (
                <Reveal key={product._id} delayMs={index * 90}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {journal ? (
        <section className="bg-surface-container py-24">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 md:grid-cols-2 md:px-16">
            <Reveal>
              {journal.eyebrow ? (
                <span className="mb-4 block font-sans text-sm text-secondary">
                  {journal.eyebrow}
                </span>
              ) : null}
              <h2 className="mb-4 font-display text-3xl font-medium text-foreground md:text-[32px]">
                {journal.title}
              </h2>
              {journal.body ? (
                <p className="mb-8 max-w-md font-sans text-base leading-relaxed text-secondary">
                  {journal.body}
                </p>
              ) : null}
              <p className="mb-8 font-sans text-sm text-foreground">
                Atelier en {settings.locationLabel}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                {journal.cta ? (
                  <Link
                    href={journal.cta.href}
                    className="font-sans text-sm text-primary transition-colors hover:text-primary-container"
                  >
                    {journal.cta.label}
                  </Link>
                ) : null}
                <WhatsAppContactCta className="mt-0" />
              </div>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="font-display text-2xl font-medium leading-snug text-foreground md:text-3xl">
                Locales, ferias y encargos. Si estás en la ciudad, escribinos y
                coordinamos.
              </p>
            </Reveal>
          </div>
        </section>
      ) : null}

      {drops.length ? (
        <section className="bg-background py-24">
          <div className="mx-auto max-w-[1280px] px-5 md:px-16">
            <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                {collections?.title ? (
                  <h2 className="mb-2 font-display text-3xl font-medium text-foreground md:text-[32px]">
                    {collections.title}
                  </h2>
                ) : null}
                {collections?.description ? (
                  <p className="max-w-md font-sans text-base text-secondary">
                    {collections.description}
                  </p>
                ) : null}
              </div>
              {collections?.exploreCta ? (
                <Link
                  href={collections.exploreCta.href}
                  className="font-sans text-sm text-primary transition-colors hover:text-primary-container"
                >
                  {collections.exploreCta.label}
                </Link>
              ) : null}
            </Reveal>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {drops.map((drop, index) => {
                const product = drop.product;
                if (!product?.slug) return null;

                const purchase = getProductPurchaseState(product);
                const label = drop.label || product.collectionLabel || undefined;
                const description =
                  drop.description || product.description || undefined;
                const imageSrc =
                  product.mainImage?.src ?? "/brand/neo-drop-golden.png";
                const imageAlt = product.mainImage?.alt ?? product.title;

                return (
                  <Reveal key={drop.id} delayMs={index * 80}>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="hover-lift group block overflow-hidden rounded-sm bg-surface-container"
                    >
                      <div className="relative aspect-4/5">
                        <Image
                          src={imageSrc}
                          alt={imageAlt}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        {purchase.badgeLabel ? (
                          <span className="absolute left-4 top-4 rounded-sm bg-background/90 px-2.5 py-1 font-sans text-[11px] text-foreground">
                            {purchase.badgeLabel}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1 p-5">
                        {label ? (
                          <span className="block font-sans text-xs text-secondary">
                            {label}
                          </span>
                        ) : null}
                        <h3 className="font-display text-xl font-medium text-foreground">
                          {product.title}
                        </h3>
                        {description ? (
                          <p className="font-sans text-sm text-secondary">
                            {description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function PathCard({
  href,
  title,
  body,
  countLabel,
  imageSrc,
  imageAlt,
  delayMs,
}: {
  href: string;
  title: string;
  body: string;
  countLabel: string;
  imageSrc?: string;
  imageAlt?: string;
  delayMs: number;
}) {
  return (
    <Reveal delayMs={delayMs}>
      <Link
        href={href}
        className="hover-lift group flex h-full overflow-hidden rounded-sm bg-background"
      >
        <div className="relative hidden w-36 shrink-0 sm:block">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt ?? title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="144px"
            />
          ) : (
            <div className="h-full bg-surface-container-high" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <h3 className="mb-2 font-display text-2xl font-medium text-foreground">
            {title}
          </h3>
          <p className="mb-4 font-sans text-sm leading-relaxed text-secondary">
            {body}
          </p>
          <span className="font-sans text-sm text-primary">{countLabel} →</span>
        </div>
      </Link>
    </Reveal>
  );
}
