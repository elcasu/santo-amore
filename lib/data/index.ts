import {
  mockCategories,
  mockFeaturedDrops,
  mockPages,
  mockProducts,
} from "@/lib/data/mocks";
import type {
  Category,
  FeaturedDrop,
  Page,
  Product,
} from "@/lib/types/content";

const useMocks = process.env.NEXT_PUBLIC_USE_SANITY_MOCKS !== "false";

const productsQuery = `*[_type == "product"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  price,
  description,
  featured,
  available,
  "mainImage": select(defined(mainImage.asset) => {
    "src": mainImage.asset->url,
    "alt": mainImage.alt
  }),
  categories[]->{ _id, title, "slug": slug.current, description }
}`;

const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  price,
  description,
  body,
  featured,
  available,
  "mainImage": select(defined(mainImage.asset) => {
    "src": mainImage.asset->url,
    "alt": mainImage.alt
  }),
  "images": images[]{
    "src": asset->url,
    "alt": alt
  },
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

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (useMocks) {
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
  if (useMocks) {
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
  if (useMocks) return mockCategories;
  const client = await sanityClient();
  return client.fetch<Category[]>(categoriesQuery);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (useMocks) {
    return mockPages.find((p) => p.slug === slug) ?? null;
  }
  const client = await sanityClient();
  return client.fetch<Page | null>(pageBySlugQuery, { slug });
}

export async function getFeaturedDrops(): Promise<FeaturedDrop[]> {
  if (useMocks) return mockFeaturedDrops;
  const featured = await getFeaturedProducts();
  return featured.map((p, i) => ({
    id: p._id,
    label: `Drop ${String(i + 1).padStart(2, "0")}`,
    title: p.title,
    description: p.description,
    image: p.mainImage?.src ?? "/brand/neo-drop-golden.png",
    href: `/producto/${p.slug}`,
    span: i === 0 ? "wide" : i === 1 ? "tall" : "square",
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
  return useMocks;
}
