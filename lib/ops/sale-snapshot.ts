import { getWriteClient } from "@/sanity/lib/write-client";

export type SaleSnapshotItemInput = {
  productId?: string;
  sku?: string;
  title?: string;
  qty?: number;
  unitPrice?: number;
  unitCost?: number;
};

export type OrderForSaleSnapshot = {
  _id: string;
  orderNumber: string;
  items?: SaleSnapshotItemInput[];
  shipping?: {
    city?: string;
    province?: string;
  };
  currency?: string;
};

export function computeSaleTotals(items: SaleSnapshotItemInput[]) {
  let revenue = 0;
  let cogs = 0;
  let missingCostItemCount = 0;

  for (const item of items) {
    const qty = typeof item.qty === "number" && item.qty > 0 ? item.qty : 0;
    const unitPrice =
      typeof item.unitPrice === "number" && item.unitPrice >= 0
        ? item.unitPrice
        : 0;
    revenue += qty * unitPrice;

    if (typeof item.unitCost === "number" && item.unitCost >= 0) {
      cogs += qty * item.unitCost;
    } else if (qty > 0) {
      missingCostItemCount += 1;
    }
  }

  return {
    revenue,
    cogs,
    grossProfit: revenue - cogs,
    missingCostItemCount,
  };
}

/**
 * Crea un saleSnapshot append-only para un pedido pagado.
 * Idempotente: si ya existe uno para orderId, no duplica.
 */
export async function ensureSaleSnapshotForOrder(
  order: OrderForSaleSnapshot,
  paidAt: string = new Date().toISOString(),
): Promise<{ created: boolean; snapshotId: string }> {
  const writeClient = getWriteClient();

  const existingId = await writeClient.fetch<string | null>(
    `*[_type == "saleSnapshot" && orderId == $orderId][0]._id`,
    { orderId: order._id },
  );
  if (existingId) {
    return { created: false, snapshotId: existingId };
  }

  const items = (order.items ?? []).map((item, index) => ({
    _type: "saleSnapshotItem" as const,
    _key: item.productId || `item-${index}`,
    productId: item.productId,
    sku: item.sku,
    title: item.title,
    qty: item.qty,
    unitPrice: item.unitPrice,
    ...(typeof item.unitCost === "number" ? { unitCost: item.unitCost } : {}),
  }));

  const totals = computeSaleTotals(order.items ?? []);

  const doc = await writeClient.create({
    _type: "saleSnapshot",
    orderId: order._id,
    orderNumber: order.orderNumber,
    paidAt,
    currency: order.currency || "ARS",
    channel: "online",
    items,
    revenue: totals.revenue,
    cogs: totals.cogs,
    grossProfit: totals.grossProfit,
    missingCostItemCount: totals.missingCostItemCount,
    customerRegion: {
      city: order.shipping?.city,
      province: order.shipping?.province,
    },
  });

  return { created: true, snapshotId: doc._id };
}

const orderForSnapshotProjection = `{
  _id,
  orderNumber,
  currency,
  items[]{ productId, sku, title, qty, unitPrice, unitCost },
  shipping{ city, province }
}`;

export async function fetchOrderForSaleSnapshot(
  orderId: string,
): Promise<OrderForSaleSnapshot | null> {
  const writeClient = getWriteClient();
  return writeClient.fetch<OrderForSaleSnapshot | null>(
    `*[_type == "order" && _id == $id][0]${orderForSnapshotProjection}`,
    { id: orderId },
  );
}
