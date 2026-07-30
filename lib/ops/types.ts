import type { CommerceStatus } from "@/lib/types/content";

export type FulfillmentStatus =
  | "to_prepare"
  | "preparing"
  | "shipped"
  | "delivered";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "rejected"
  | "cancelled";

export type SaleChannel =
  | "online"
  | "feria"
  | "local"
  | "whatsapp"
  | "other";

export type OfflineSaleChannel = Exclude<SaleChannel, "online">;

export type OpsProduct = {
  _id: string;
  title: string;
  sku?: string;
  commerceStatus: CommerceStatus;
  trackInventory: boolean;
  stockQty?: number;
  mainImage?: { src: string; alt?: string };
};

/** Producto con precio/costo para el form de ventas offline. */
export type OpsSaleProduct = OpsProduct & {
  price?: number;
  unitCost?: number;
};

export type OpsOrderItem = {
  productId?: string;
  title?: string;
  slug?: string;
  sku?: string;
  qty?: number;
  unitPrice?: number;
};

export type OpsOrder = {
  _id: string;
  orderNumber: string;
  status: OrderPaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OpsOrderItem[];
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  shipping?: {
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    notes?: string;
  };
  subtotal?: number;
  currency?: string;
  _createdAt: string;
};

export const COMMERCE_STATUSES: CommerceStatus[] = [
  "available",
  "coming_soon",
  "sold_out",
  "made_to_order",
];

export const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "to_prepare",
  "preparing",
  "shipped",
  "delivered",
];

export const COMMERCE_STATUS_LABELS: Record<CommerceStatus, string> = {
  available: "Disponible",
  coming_soon: "Próximamente",
  sold_out: "Agotado",
  made_to_order: "Encargo",
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  to_prepare: "Por preparar",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
};

export const OFFLINE_SALE_CHANNELS: OfflineSaleChannel[] = [
  "feria",
  "local",
  "whatsapp",
  "other",
];

export const SALE_CHANNEL_LABELS: Record<SaleChannel, string> = {
  online: "Online",
  feria: "Feria",
  local: "Local",
  whatsapp: "WhatsApp",
  other: "Otro",
};

export function isOfflineSaleChannel(
  value: unknown,
): value is OfflineSaleChannel {
  return (
    typeof value === "string" &&
    (OFFLINE_SALE_CHANNELS as string[]).includes(value)
  );
}

export function isCommerceStatus(value: unknown): value is CommerceStatus {
  return (
    typeof value === "string" &&
    (COMMERCE_STATUSES as string[]).includes(value)
  );
}

export function isFulfillmentStatus(
  value: unknown,
): value is FulfillmentStatus {
  return (
    typeof value === "string" &&
    (FULFILLMENT_STATUSES as string[]).includes(value)
  );
}
