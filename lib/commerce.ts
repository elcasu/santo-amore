import type { CommerceStatus, Product } from "@/lib/types/content";

export type ProductPurchaseState = {
  status: CommerceStatus;
  canPurchase: boolean;
  badgeLabel: string | null;
  ctaLabel: string;
  stockHint: string | null;
};

export const AVAILABILITY_FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "listas", label: "Listas" },
  { id: "encargo", label: "Encargo" },
  { id: "proximamente", label: "Próximamente" },
] as const;

export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number]["id"];

export function parseAvailabilityFilter(
  value?: string | null,
): AvailabilityFilter {
  if (
    value === "listas" ||
    value === "encargo" ||
    value === "proximamente"
  ) {
    return value;
  }
  return "todas";
}

export function buildCatalogHref(options?: {
  categoria?: string;
  disponibilidad?: AvailabilityFilter | string | null;
}): string {
  const params = new URLSearchParams();
  const categoria = options?.categoria?.trim();
  const disponibilidad = parseAvailabilityFilter(options?.disponibilidad);

  if (categoria) params.set("categoria", categoria);
  if (disponibilidad !== "todas") {
    params.set("disponibilidad", disponibilidad);
  }

  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export function filterProductsByAvailability<
  T extends Pick<Product, "commerceStatus" | "trackInventory" | "stockQty">,
>(products: T[], filter: AvailabilityFilter): T[] {
  if (filter === "todas") return products;
  return products.filter((product) => {
    const status = getEffectiveCommerceStatus(product);
    if (filter === "listas") return status === "available";
    if (filter === "encargo") return status === "made_to_order";
    return status === "coming_soon";
  });
}

export function getEffectiveCommerceStatus(
  product: Pick<
    Product,
    "commerceStatus" | "trackInventory" | "stockQty"
  >,
): CommerceStatus {
  const status = product.commerceStatus ?? "available";
  if (
    status === "available" &&
    product.trackInventory &&
    (product.stockQty ?? 0) <= 0
  ) {
    return "sold_out";
  }
  return status;
}

export function getProductPurchaseState(
  product: Pick<
    Product,
    | "commerceStatus"
    | "trackInventory"
    | "stockQty"
    | "comingSoonLabel"
    | "leadTimeDays"
  >,
): ProductPurchaseState {
  const status = getEffectiveCommerceStatus(product);

  switch (status) {
    case "coming_soon":
      return {
        status,
        canPurchase: false,
        badgeLabel: product.comingSoonLabel ?? "Próximamente",
        ctaLabel: "Avisame",
        stockHint: null,
      };
    case "sold_out":
      return {
        status,
        canPurchase: false,
        badgeLabel: "Agotado",
        ctaLabel: "Agotado",
        stockHint: null,
      };
    case "made_to_order":
      return {
        status,
        canPurchase: true,
        badgeLabel: "Encargo",
        ctaLabel: "Agregar encargo",
        stockHint:
          typeof product.leadTimeDays === "number"
            ? `Elaboración estimada: ${product.leadTimeDays} días`
            : null,
      };
    case "available":
    default: {
      const stockHint =
        product.trackInventory && typeof product.stockQty === "number"
          ? product.stockQty === 1
            ? "Última unidad"
            : `${product.stockQty} disponibles`
          : null;
      return {
        status: "available",
        canPurchase: true,
        badgeLabel: null,
        ctaLabel: "Agregar al carrito",
        stockHint,
      };
    }
  }
}
