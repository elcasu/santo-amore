import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFeaturedDrops, getFeaturedProducts } from "@/lib/data";

export default async function HomePage() {
  const [drops, featured] = await Promise.all([
    getFeaturedDrops(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <section className="relative flex min-h-[92vh] items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-foreground/70 via-foreground/35 to-transparent" />
          <Image
            src="/brand/neo-drop-atrium.png"
            alt=""
            fill
            priority
            className="scale-105 object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[1280px] px-5 py-24 md:px-16">
          <div className="max-w-3xl">
            <span className="mb-6 block animate-fade-rise font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-primary-fixed-dim">
              The 2026 Curation
            </span>
            {/* Sin text-shadow ni transform/opacity en el h1: evitan el recorte del borde izquierdo de la A */}
            <h1 className="mb-8 font-display text-[40px] font-bold leading-[1.15] text-white md:text-[64px]">
              Artisanal Soul,{" "}
              <span className="rounded bg-primary/40 px-2 text-white">
                Modern Grace.
              </span>
            </h1>
            <p className="mb-10 max-w-xl animate-fade-rise font-sans text-lg leading-relaxed text-white/90 [animation-delay:80ms]">
              Descubrí una colección donde el oficio artesanal encuentra
              siluetas contemporáneas. Accesorios y home con presencia.
            </p>
            <div className="flex animate-fade-rise flex-wrap gap-4 [animation-delay:140ms]">
              <Link
                href="/catalogo"
                className="rounded bg-primary px-8 py-4 font-display text-lg font-semibold text-white shadow-sm transition-transform duration-300 hover:scale-105 hover:bg-primary-container"
              >
                Ver catálogo
              </Link>
              <Link
                href="/nosotros"
                className="rounded border-2 border-white bg-white/15 px-8 py-4 font-display text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-foreground"
              >
                Heritage
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-2 font-display text-2xl font-semibold text-foreground md:text-[32px]">
                Featured Collections
              </h2>
              <p className="max-w-md font-sans text-base text-secondary">
                Drops de temporada, curados con estética Neo Luxury refined.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="group flex items-center gap-2 border-b-2 border-primary pb-1 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary"
            >
              Explorar todo
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>

          <div className="grid auto-rows-[280px] grid-cols-1 gap-6 md:auto-rows-[360px] md:grid-cols-12">
            {drops.map((drop) => {
              const span =
                drop.span === "wide"
                  ? "md:col-span-8"
                  : drop.span === "tall"
                    ? "md:col-span-4 md:row-span-2"
                    : "md:col-span-4";
              return (
                <Link
                  key={drop.id}
                  href={drop.href}
                  className={`hover-lift group relative overflow-hidden rounded-xl bg-surface-container ${span}`}
                >
                  <Image
                    src={drop.image}
                    alt={drop.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <span className="mb-2 block font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary-fixed-dim">
                      {drop.label}
                    </span>
                    <h3 className="font-display text-2xl font-semibold">
                      {drop.title}
                    </h3>
                    {drop.description ? (
                      <p className="mt-2 max-w-sm font-sans text-sm text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {drop.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              );
            })}

            <div className="hover-lift flex flex-col justify-between rounded-xl bg-surface-container-high p-8 md:col-span-4">
              <div>
                <span className="mb-4 block font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
                  The Journal
                </span>
                <h3 className="mb-4 font-display text-2xl font-semibold text-foreground">
                  Behind the Seams: The Hand of the Artist
                </h3>
                <p className="font-sans text-base text-secondary">
                  Oficio, materia y gesto — el alma artesanal detrás de cada
                  pieza Santo Amore.
                </p>
              </div>
              <Link
                href="/nosotros"
                className="mt-8 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
              >
                Leer más →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/40 bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-16">
          <div className="mb-12 flex items-end justify-between gap-6">
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-[32px]">
              Piezas destacadas
            </h2>
            <Link
              href="/catalogo"
              className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-primary"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
