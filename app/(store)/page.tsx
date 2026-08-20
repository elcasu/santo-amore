import Image from "next/image";
import Link from "next/link";

import { Magnetic } from "@/components/motion/magnetic";
import { MagneticField } from "@/components/motion/magnetic-field";
import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product-card";
import { getProductPurchaseState } from "@/lib/commerce";
import { getHomePage } from "@/lib/data";

export default async function HomePage() {
  const { home, source } = await getHomePage();
  const { hero, collections, journal, featuredProducts } = home;
  const drops = collections?.drops ?? [];
  const products = featuredProducts?.products?.slice(0, 3) ?? [];

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

      <section className="relative flex min-h-[92vh] items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {hero.backgroundImage?.src ? (
            <Image
              src={hero.backgroundImage.src}
              alt={hero.backgroundImage.alt ?? ""}
              fill
              priority
              className="scale-105 object-cover object-center"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-foreground/70 via-foreground/35 to-transparent" />
          <MagneticField className="z-20" />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[1280px] px-5 py-24 md:px-16">
          <div className="max-w-3xl">
            {hero.eyebrow ? (
              <span className="mb-6 block animate-fade-rise font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-primary-fixed-dim">
                {hero.eyebrow}
              </span>
            ) : null}
            <h1 className="mb-8 animate-fade-rise font-display text-[40px] font-bold leading-[1.15] text-white [animation-delay:60ms] md:text-[64px]">
              {hero.title}
              {hero.titleHighlight ? (
                <>
                  {" "}
                  <span className="rounded bg-primary/40 px-2 text-white">
                    {hero.titleHighlight}
                  </span>
                </>
              ) : null}
            </h1>
            {hero.subtitle ? (
              <p className="mb-10 max-w-xl animate-fade-rise font-sans text-lg leading-relaxed text-white/90 [animation-delay:120ms]">
                {hero.subtitle}
              </p>
            ) : null}
            <div className="flex animate-fade-rise flex-wrap gap-4 [animation-delay:200ms]">
              {hero.primaryCta ? (
                <Magnetic className="inline-flex" maxPull={6}>
                  <Link
                    href={hero.primaryCta.href}
                    className="rounded bg-primary px-8 py-4 font-display text-lg font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-primary-container"
                  >
                    {hero.primaryCta.label}
                  </Link>
                </Magnetic>
              ) : null}
              {hero.secondaryCta ? (
                <Magnetic className="inline-flex" maxPull={6}>
                  <Link
                    href={hero.secondaryCta.href}
                    className="rounded border-2 border-white bg-white/15 px-8 py-4 font-display text-lg font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-foreground"
                  >
                    {hero.secondaryCta.label}
                  </Link>
                </Magnetic>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <Reveal className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              {collections?.title ? (
                <h2 className="mb-2 font-display text-2xl font-semibold text-foreground md:text-[32px]">
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
                className="group flex items-center gap-2 border-b-2 border-primary pb-1 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary"
              >
                {collections.exploreCta.label}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            ) : null}
          </Reveal>

          <div className="grid auto-rows-auto grid-cols-1 gap-6 md:auto-rows-[360px] md:grid-cols-12">
            {drops.map((drop, index) => {
              const product = drop.product;
              if (!product?.slug) return null;

              const purchase = getProductPurchaseState(product);
              const span =
                drop.span === "wide"
                  ? "md:col-span-8"
                  : drop.span === "tall"
                    ? "md:col-span-4 md:row-span-2"
                    : "md:col-span-4";
              const label = drop.label || product.collectionLabel || undefined;
              const description =
                drop.description || product.description || undefined;
              const imageSrc =
                product.mainImage?.src ?? "/brand/neo-drop-golden.png";
              const imageAlt = product.mainImage?.alt ?? product.title;

              return (
                <Reveal
                  key={drop.id}
                  className={`h-full min-h-[280px] md:min-h-0 ${span}`}
                  delayMs={index * 80}
                >
                  <Link
                    href={`/producto/${product.slug}`}
                    className="hover-lift group relative block h-full min-h-[280px] overflow-hidden rounded-xl bg-surface-container md:min-h-0"
                  >
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-foreground/80 via-transparent to-transparent" />
                    {purchase.badgeLabel ? (
                      <span className="absolute left-4 top-4 z-10 rounded bg-foreground/90 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white md:left-6 md:top-6">
                        {purchase.badgeLabel}
                      </span>
                    ) : null}
                    <div className="absolute bottom-8 left-8 text-white">
                      {label ? (
                        <span className="mb-2 block font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary-fixed-dim">
                          {label}
                        </span>
                      ) : null}
                      <h3 className="font-display text-2xl font-semibold">
                        {product.title}
                      </h3>
                      {description ? (
                        <p className="mt-2 max-w-sm font-sans text-sm text-white/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          {description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              );
            })}

            {journal ? (
              <Reveal className="md:col-span-4" delayMs={drops.length * 80}>
                <div className="hover-lift flex h-full flex-col justify-between gap-8 rounded-xl bg-surface-container-high p-8">
                  <div>
                    {journal.eyebrow ? (
                      <span className="mb-4 block font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
                        {journal.eyebrow}
                      </span>
                    ) : null}
                    <h3 className="mb-4 font-display text-2xl font-semibold text-foreground">
                      {journal.title}
                    </h3>
                    {journal.body ? (
                      <p className="font-sans text-base text-secondary">
                        {journal.body}
                      </p>
                    ) : null}
                  </div>
                  {journal.cta ? (
                    <Link
                      href={journal.cta.href}
                      className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                    >
                      {journal.cta.label}
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {products.length ? (
        <section className="border-t border-outline-variant/40 bg-white py-24">
          <div className="mx-auto max-w-[1280px] px-5 md:px-16">
            <Reveal className="mb-12 flex items-end justify-between gap-6">
              <h2 className="font-display text-2xl font-semibold text-foreground md:text-[32px]">
                {featuredProducts?.title ?? "Piezas destacadas"}
              </h2>
              {featuredProducts?.viewAllCta ? (
                <Link
                  href={featuredProducts.viewAllCta.href}
                  className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary"
                >
                  {featuredProducts.viewAllCta.label}
                </Link>
              ) : null}
            </Reveal>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <Reveal key={product._id} delayMs={index * 90}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
