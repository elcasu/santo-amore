import {
  mockCategories,
  mockFeaturedDrops,
  mockHome,
  mockPages,
  mockProducts,
} from "@/lib/data/mocks";
import type {
  Category,
  FeaturedDrop,
  HomePage,
  Page,
  Product,
} from "@/lib/types/content";

function usingMocks(): boolean {
  // Preferir flag server-only (se lee en cada request; no hace falta rebuild).
  // NEXT_PUBLIC_* queda como alias, pero Next lo “congela” al arrancar el dev server.
  const explicit =
    process.env.USE_SANITY_MOCKS ?? process.env.NEXT_PUBLIC_USE_SANITY_MOCKS;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  // Sin flag: mocks solo si todavía no hay project id.
  return !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}

const imageProjection = `{
  "src": asset->url,
  "alt": alt
}`;

const productCardProjection = `{
  _id,
  title,
  "slug": slug.current,
  price,
  description,
  featured,
  available,
  collectionLabel,
  "mainImage": mainImage${imageProjection},
  categories[]->{ _id, title, "slug": slug.current, description }
}`;

const homeQuery = `*[_type == "home" && _id == "home"][0]{
  hero{
    eyebrow,
    title,
    titleHighlight,
    subtitle,
    "backgroundImage": backgroundImage${imageProjection},
    primaryCta,
    secondaryCta
  },
  collections{
    title,
    description,
    exploreCta,
    "drops": drops[]{
      "id": _key,
      label,
      description,
      span,
      "product": product->${productCardProjection}
    }
  },
  journal{
    eyebrow,
    title,
    body,
    cta
  },
  featuredProducts{
    title,
    viewAllCta,
    "products": products[]->${productCardProjection}
  }
}`;

const productsQuery = `*[_type == "product"] | order(title asc) ${productCardProjection}`;

const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  price,
  description,
  body,
  featured,
  available,
  collectionLabel,
  "mainImage": mainImage${imageProjection},
  "images": images[]${imageProjection},
  categories[]->{ _id, title, "slug": slug.current, description }
}`;

const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id, title, "slug": slug.current, description
}`;

const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0] {
  _id, title, "slug": slug.current, excerpt, body
}`;

async function sanityClient() {
  const { client } = await import("@/sanity/lib/client");
  return client;
}

export async function getHomePage(): Promise<{
  home: HomePage;
  source: "mock" | "sanity" | "sanity-fallback";
}> {
  if (usingMocks()) return { home: mockHome, source: "mock" };

  const client = await sanityClient();
  const home = await client.fetch<HomePage | null>(homeQuery);
  if (!home?.hero?.title) {
    console.warn(
      "[santo-amore] No hay documento Home publicado en Sanity (id: home). " +
        "Abrí /studio → Home, completá y Publish. Mientras tanto se usa mockHome.",
    );
    return { home: mockHome, source: "sanity-fallback" };
  }

  const featuredFromHome =
    home.featuredProducts?.products?.filter(Boolean) ?? [];
  if (!featuredFromHome.length) {
    const fallback = await getFeaturedProducts();
    return {
      home: {
        ...home,
        featuredProducts: {
          ...home.featuredProducts,
          products: fallback.slice(0, 3),
        },
      },
      source: "sanity",
    };
  }

  return { home, source: "sanity" };
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (usingMocks()) {
    if (!categorySlug) return mockProducts;
    return mockProducts.filter((p) =>
      p.categories?.some((c) => c.slug === categorySlug),
    );
  }

  const client = await sanityClient();
  const products = await client.fetch<Product[]>(productsQuery);
  if (!categorySlug) return products;
  return products.filter((p) =>
    p.categories?.some((c) => c.slug === categorySlug),
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (usingMocks()) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  const client = await sanityClient();
  return client.fetch<Product | null>(productBySlugQuery, { slug });
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured);
  return featured.length ? featured : products.slice(0, 3);
}

export async function getCategories(): Promise<Category[]> {
  if (usingMocks()) return mockCategories;
  const client = await sanityClient();
  return client.fetch<Category[]>(categoriesQuery);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (usingMocks()) {
    return mockPages.find((p) => p.slug === slug) ?? null;
  }
  const client = await sanityClient();
  return client.fetch<Page | null>(pageBySlugQuery, { slug });
}

export async function getFeaturedDrops(): Promise<FeaturedDrop[]> {
  if (usingMocks()) return mockFeaturedDrops;
  const { home } = await getHomePage();
  const drops =
    home.collections?.drops?.filter((d) => d.product?._id && d.product?.slug) ??
    [];
  if (drops.length) return drops;

  const featured = await getFeaturedProducts();
  return featured.map((p, i) => ({
    id: p._id,
    label: p.collectionLabel || `Drop ${String(i + 1).padStart(2, "0")}`,
    span: (i === 0 ? "wide" : i === 1 ? "tall" : "square") as FeaturedDrop["span"],
    product: p,
  }));
}

export function formatPriceArs(price?: number): string {
  if (typeof price !== "number") return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export function isUsingMocks(): boolean {
  return usingMocks();
}
