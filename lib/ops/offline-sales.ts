import { freshClient } from "@/sanity/lib/client";
import { getWriteClient } from "@/sanity/lib/write-client";

import { getOpsSaleProduct } from "./products";
import { computeSaleTotals } from "./sale-snapshot";
import {
  applyTrackedStockDeductions,
  type StockDeductionInput,
} from "./stock";
import type { OfflineSaleChannel } from "./types";

export type OfflineSaleItemInput = {
  productId: string;
  qty: number;
  unitPrice: number;
};

export type CreateOfflineSaleInput = {
  channel: OfflineSaleChannel;
  notes?: string;
  items: OfflineSaleItemInput[];
  paidAt?: string;
};

export type OfflineSale = {
  _id: string;
  orderId: string;
  orderNumber: string;
  paidAt: string;
  channel: OfflineSaleChannel;
  notes?: string;
  currency: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  missingCostItemCount: number;
  items: {
    productId?: string;
    sku?: string;
    title?: string;
    qty?: number;
    unitPrice?: number;
    unitCost?: number;
  }[];
};

const OFFLINE_CHANNELS = ["feria", "local", "whatsapp", "other"] as const;

const listProjection = `{
  _id,
  orderId,
  orderNumber,
  paidAt,
  channel,
  notes,
  currency,
  revenue,
  cogs,
  grossProfit,
  missingCostItemCount,
  items[]{ productId, sku, title, qty, unitPrice, unitCost }
}`;

const listQuery = `*[_type == "saleSnapshot" && channel in $channels] | order(paidAt desc)[0...50] ${listProjection}`;

function makeOrderNumber(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OFF-${yy}${mm}${dd}-${suffix}`;
}

export async function listOfflineSales(): Promise<OfflineSale[]> {
  const rows = await freshClient.fetch<OfflineSale[]>(listQuery, {
    channels: OFFLINE_CHANNELS,
  });
  return rows ?? [];
}

export async function createOfflineSale(
  input: CreateOfflineSaleInput,
): Promise<OfflineSale> {
  if (!input.items.length) {
    throw new Error("Agregá al menos un producto");
  }

  const paidAt = input.paidAt ?? new Date().toISOString();
  const orderId = `offline:${crypto.randomUUID()}`;
  const orderNumber = makeOrderNumber(new Date(paidAt));

  const frozenItems: {
    _type: "saleSnapshotItem";
    _key: string;
    productId: string;
    sku?: string;
    title: string;
    qty: number;
    unitPrice: number;
    unitCost?: number;
  }[] = [];

  const deductions: StockDeductionInput[] = [];

  for (const [index, line] of input.items.entries()) {
    if (
      typeof line.qty !== "number" ||
      !Number.isInteger(line.qty) ||
      line.qty < 1
    ) {
      throw new Error("Cantidad inválida");
    }
    if (typeof line.unitPrice !== "number" || line.unitPrice < 0) {
      throw new Error("Precio inválido");
    }

    const product = await getOpsSaleProduct(line.productId);
    if (!product) {
      throw new Error(`Producto no encontrado: ${line.productId}`);
    }

    frozenItems.push({
      _type: "saleSnapshotItem",
      _key: product._id || `item-${index}`,
      productId: product._id,
      sku: product.sku,
      title: product.title,
      qty: line.qty,
      unitPrice: line.unitPrice,
      ...(typeof product.unitCost === "number"
        ? { unitCost: product.unitCost }
        : {}),
    });

    deductions.push({
      productId: product._id,
      qty: line.qty,
      trackInventory: product.trackInventory,
      commerceStatus: product.commerceStatus,
      currentStock: product.stockQty,
    });
  }

  const totals = computeSaleTotals(frozenItems);
  const notes = input.notes?.trim() || undefined;

  const writeClient = getWriteClient();

  const doc = await writeClient.create({
    _type: "saleSnapshot",
    orderId,
    orderNumber,
    paidAt,
    currency: "ARS",
    channel: input.channel,
    ...(notes ? { notes } : {}),
    items: frozenItems,
    revenue: totals.revenue,
    cogs: totals.cogs,
    grossProfit: totals.grossProfit,
    missingCostItemCount: totals.missingCostItemCount,
  });

  // Snapshot primero; luego stock (trackInventory, no made_to_order).
  await applyTrackedStockDeductions(deductions, {
    logContext: `venta ${orderNumber}`,
  });

  return {
    _id: doc._id,
    orderId,
    orderNumber,
    paidAt,
    channel: input.channel,
    notes,
    currency: "ARS",
    revenue: totals.revenue,
    cogs: totals.cogs,
    grossProfit: totals.grossProfit,
    missingCostItemCount: totals.missingCostItemCount,
    items: frozenItems.map(({ productId, sku, title, qty, unitPrice, unitCost }) => ({
      productId,
      sku,
      title,
      qty,
      unitPrice,
      unitCost,
    })),
  };
}
