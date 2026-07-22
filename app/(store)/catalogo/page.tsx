import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/data";

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(categoria),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-16">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
          Catálogo
        </p>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Colecciones
        </h1>
        <p className="font-sans text-base text-secondary">
          Accesorios y home con dirección Neo Luxury refined. Datos mock por
          ahora; Sanity cuando el contenido esté listo.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <FilterChip href="/catalogo" active={!categoria} label="Todas" />
        {categories.map((cat) => (
          <FilterChip
            key={cat._id}
            href={`/catalogo?categoria=${cat.slug}`}
            active={categoria === cat.slug}
            label={cat.title}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="font-sans text-secondary">No hay productos en esta categoría.</p>
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
      className={`rounded-full px-4 py-2 font-sans text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-secondary hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
