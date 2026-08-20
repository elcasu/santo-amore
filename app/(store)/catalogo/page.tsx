import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product-card";
import {
  AVAILABILITY_FILTERS,
  buildCatalogHref,
  filterProductsByAvailability,
  parseAvailabilityFilter,
} from "@/lib/commerce";
import { getCategories, getProducts } from "@/lib/data";

type Props = {
  searchParams: Promise<{ categoria?: string; disponibilidad?: string }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const { categoria, disponibilidad } = await searchParams;
  const availability = parseAvailabilityFilter(disponibilidad);
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(categoria),
  ]);
  const visible = filterProductsByAvailability(products, availability);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-16">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 font-sans text-sm text-secondary">Catálogo</p>
        <h1 className="mb-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Piezas
        </h1>
        <p className="font-sans text-base text-secondary">
          Accesorios y home del atelier. Listas para llevar o hechas a pedido.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          href={buildCatalogHref({ disponibilidad: availability })}
          active={!categoria}
          label="Todas"
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat._id}
            href={buildCatalogHref({
              categoria: cat.slug,
              disponibilidad: availability,
            })}
            active={categoria === cat.slug}
            label={cat.title}
          />
        ))}
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {AVAILABILITY_FILTERS.map((filter) => (
          <FilterChip
            key={filter.id}
            href={buildCatalogHref({
              categoria,
              disponibilidad: filter.id,
            })}
            active={availability === filter.id}
            label={filter.label}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product, index) => (
          <Reveal key={product._id} delayMs={index * 70}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="font-sans text-secondary">
          No hay piezas con ese filtro. Probá otra disponibilidad o categoría.
        </p>
      ) : null}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 font-sans text-sm transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-secondary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
