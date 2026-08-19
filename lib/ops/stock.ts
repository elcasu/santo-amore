import { getWriteClient } from "@/sanity/lib/write-client";

import { getOpsSaleProduct } from "./products";

export type StockDeductionInput = {
  productId: string;
  qty: number;
  trackInventory: boolean;
  commerceStatus?: string;
  currentStock: number | undefined;
};

export function shouldDecrementTrackedStock(input: {
  trackInventory: boolean;
  commerceStatus?: string;
}): boolean {
  if (!input.trackInventory) return false;
  if (input.commerceStatus === "made_to_order") return false;
  return true;
}

export function nextStockQty(
  currentStock: number | undefined,
  qty: number,
): number {
  const current =
    typeof currentStock === "number" && currentStock >= 0 ? currentStock : 0;
  return Math.max(0, current - qty);
}

export function stockPatchForDeduction(input: {
  currentStock: number | undefined;
  qty: number;
}): { stockQty: number; commerceStatus?: "sold_out" } {
  const stockQty = nextStockQty(input.currentStock, input.qty);
  if (stockQty === 0) {
    return { stockQty, commerceStatus: "sold_out" };
  }
  return { stockQty };
}

/** Agrupa qty por producto y descarta líneas que no descuentan inventario. */
export function groupTrackedStockDeductions(
  inputs: StockDeductionInput[],
): StockDeductionInput[] {
  const qtyByProduct = new Map<string, StockDeductionInput>();
  for (const d of inputs) {
    if (!shouldDecrementTrackedStock(d)) continue;
    const prev = qtyByProduct.get(d.productId);
    if (prev) {
      prev.qty += d.qty;
    } else {
      qtyByProduct.set(d.productId, { ...d });
    }
  }
  return [...qtyByProduct.values()];
}

export async function applyTrackedStockDeductions(
  inputs: StockDeductionInput[],
  options?: { logContext?: string },
): Promise<{ failedProductIds: string[] }> {
  const writeClient = getWriteClient();
  const grouped = groupTrackedStockDeductions(inputs);
  const failedProductIds: string[] = [];

  for (const d of grouped) {
    try {
      await writeClient
        .patch(d.productId)
        .set(stockPatchForDeduction(d))
        .commit();
    } catch (error) {
      console.error("[ops/stock] patch failed", d.productId, error);
      failedProductIds.push(d.productId);
    }
  }

  if (failedProductIds.length > 0 && options?.logContext) {
    console.warn(
      `[ops/stock] ${options.logContext} creada pero falló stock en: ${failedProductIds.join(", ")}`,
    );
  }

  return { failedProductIds };
}

type OrderForStock = {
  _id: string;
  orderNumber?: string;
  stockAppliedAt?: string;
  items?: { productId?: string; qty?: number }[];
};

/**
 * Descuenta stock de un pedido online pagado.
 * Idempotente via `order.stockAppliedAt`. No toca `made_to_order` ni productos sin `trackInventory`.
 */
export async function ensureStockAppliedForPaidOrder(
  orderId: string,
): Promise<{ applied: boolean; skipped: boolean; failedProductIds: string[] }> {
  const writeClient = getWriteClient();
  const order = await writeClient.fetch<OrderForStock | null>(
    `*[_type == "order" && _id == $id][0]{
      _id,
      orderNumber,
      stockAppliedAt,
      items[]{ productId, qty }
    }`,
    { id: orderId },
  );

  if (!order || order.stockAppliedAt) {
    return { applied: false, skipped: true, failedProductIds: [] };
  }

  const deductions: StockDeductionInput[] = [];
  for (const line of order.items ?? []) {
    if (!line.productId || typeof line.qty !== "number" || line.qty < 1) {
      continue;
    }
    const product = await getOpsSaleProduct(line.productId);
    if (!product) {
      console.warn("[ops/stock] producto no encontrado", line.productId);
      continue;
    }
    deductions.push({
      productId: product._id,
      qty: line.qty,
      trackInventory: product.trackInventory,
      commerceStatus: product.commerceStatus,
      currentStock: product.stockQty,
    });
  }

  const { failedProductIds } = await applyTrackedStockDeductions(deductions, {
    logContext: `pedido ${order.orderNumber ?? orderId}`,
  });

  await writeClient
    .patch(orderId)
    .setIfMissing({ stockAppliedAt: new Date().toISOString() })
    .commit();

  return { applied: true, skipped: false, failedProductIds };
}
