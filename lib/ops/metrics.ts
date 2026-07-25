import { client } from "@/sanity/lib/client";

import type { FulfillmentStatus } from "./types";

export type MetricsPeriodPreset = "7d" | "30d" | "90d" | "custom";

export type MetricsQuery = {
  from: string; // ISO date (start of day)
  to: string; // ISO date (end of day exclusive or inclusive end)
};

export type ProductMetricRow = {
  productId: string;
  title: string;
  sku?: string;
  units: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  /** grossProfit / cogs cuando cogs > 0; null si no hay costo. */
  productRoi: number | null;
  marginPct: number | null;
  missingCost: boolean;
  /** Heurística: alto revenue y margen bajo. */
  lowMarginHighVolume: boolean;
};

export type OpsFulfillmentMetrics = {
  toPrepare: number;
  preparing: number;
  shipped: number;
  delivered: number;
  /** Promedio horas desde paidAt (saleSnapshot) hasta shippedAt, si hay datos. */
  avgHoursToShip: number | null;
  /** Promedio horas desde paidAt hasta deliveredAt. */
  avgHoursToDeliver: number | null;
  sampleSizeShipped: number;
  sampleSizeDelivered: number;
};

export type OpsMetricsResult = {
  from: string;
  to: string;
  sales: {
    orderCount: number;
    revenue: number;
    averageTicket: number;
    cogs: number;
    grossProfit: number;
    marginPct: number | null;
    missingCostItemCount: number;
    snapshotsWithMissingCost: number;
  };
  products: ProductMetricRow[];
  fulfillment: OpsFulfillmentMetrics;
};

type SaleSnapshotDoc = {
  orderId: string;
  orderNumber: string;
  paidAt: string;
  revenue?: number;
  cogs?: number;
  grossProfit?: number;
  missingCostItemCount?: number;
  items?: {
    productId?: string;
    sku?: string;
    title?: string;
    qty?: number;
    unitPrice?: number;
    unitCost?: number;
  }[];
};

type FulfillmentOrderDoc = {
  _id: string;
  fulfillmentStatus?: FulfillmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  _createdAt: string;
};

function startOfDayIso(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
  return d.toISOString();
}

function endOfDayExclusiveIso(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export function resolveMetricsRange(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}): MetricsQuery {
  const today = new Date();
  const toDate = today.toISOString().slice(0, 10);

  if (input.from && input.to) {
    return { from: input.from, to: input.to };
  }

  const preset = (input.preset || "30d") as MetricsPeriodPreset;
  const days = preset === "7d" ? 7 : preset === "90d" ? 90 : 30;
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString().slice(0, 10), to: toDate };
}

function hoursBetween(fromIso: string, toIso: string): number | null {
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return (b - a) / (1000 * 60 * 60);
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export async function getOpsMetrics(
  range: MetricsQuery,
): Promise<OpsMetricsResult> {
  const fromIso = startOfDayIso(range.from);
  const toIso = endOfDayExclusiveIso(range.to);

  const snapshots = await client.fetch<SaleSnapshotDoc[]>(
    `*[_type == "saleSnapshot" && paidAt >= $from && paidAt < $to] | order(paidAt desc) {
      orderId,
      orderNumber,
      paidAt,
      revenue,
      cogs,
      grossProfit,
      missingCostItemCount,
      items[]{ productId, sku, title, qty, unitPrice, unitCost }
    }`,
    { from: fromIso, to: toIso },
  );

  let revenue = 0;
  let cogs = 0;
  let grossProfit = 0;
  let missingCostItemCount = 0;
  let snapshotsWithMissingCost = 0;

  const byProduct = new Map<
    string,
    {
      productId: string;
      title: string;
      sku?: string;
      units: number;
      revenue: number;
      cogs: number;
      missingCost: boolean;
    }
  >();

  for (const snap of snapshots) {
    const snapRevenue = snap.revenue ?? 0;
    const snapCogs = snap.cogs ?? 0;
    const snapProfit = snap.grossProfit ?? snapRevenue - snapCogs;
    revenue += snapRevenue;
    cogs += snapCogs;
    grossProfit += snapProfit;
    const missing = snap.missingCostItemCount ?? 0;
    missingCostItemCount += missing;
    if (missing > 0) snapshotsWithMissingCost += 1;

    for (const item of snap.items ?? []) {
      const productId = item.productId || "unknown";
      const qty = typeof item.qty === "number" ? item.qty : 0;
      const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
      const hasCost = typeof item.unitCost === "number" && item.unitCost >= 0;
      const unitCost = hasCost ? item.unitCost! : 0;
      const existing = byProduct.get(productId);
      if (existing) {
        existing.units += qty;
        existing.revenue += qty * unitPrice;
        existing.cogs += qty * unitCost;
        existing.missingCost = existing.missingCost || !hasCost;
        if (!existing.sku && item.sku) existing.sku = item.sku;
        if (item.title) existing.title = item.title;
      } else {
        byProduct.set(productId, {
          productId,
          title: item.title || "Producto",
          sku: item.sku,
          units: qty,
          revenue: qty * unitPrice,
          cogs: qty * unitCost,
          missingCost: !hasCost,
        });
      }
    }
  }

  const orderCount = snapshots.length;
  const averageTicket = orderCount > 0 ? revenue / orderCount : 0;
  const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : null;

  const productRows: ProductMetricRow[] = Array.from(byProduct.values()).map(
    (row) => {
      const profit = row.revenue - row.cogs;
      const productRoi =
        row.cogs > 0 && !row.missingCost ? profit / row.cogs : null;
      const rowMargin =
        row.revenue > 0 && !row.missingCost
          ? (profit / row.revenue) * 100
          : null;
      return {
        productId: row.productId,
        title: row.title,
        sku: row.sku,
        units: row.units,
        revenue: row.revenue,
        cogs: row.cogs,
        grossProfit: profit,
        productRoi,
        marginPct: rowMargin,
        missingCost: row.missingCost,
        lowMarginHighVolume: false,
      };
    },
  );

  productRows.sort((a, b) => b.revenue - a.revenue);

  // Heurística: top 50% por revenue y margen < 30% (o missing cost).
  if (productRows.length > 0) {
    const mid = Math.max(1, Math.ceil(productRows.length / 2));
    const topByRevenue = new Set(
      productRows.slice(0, mid).map((p) => p.productId),
    );
    for (const row of productRows) {
      row.lowMarginHighVolume =
        topByRevenue.has(row.productId) &&
        (row.missingCost ||
          (row.marginPct !== null && row.marginPct < 30));
    }
  }

  // Fulfillment: pedidos pagados (operación), no saleSnapshot.
  const paidOrders = await client.fetch<FulfillmentOrderDoc[]>(
    `*[_type == "order" && status == "paid"]{
      _id,
      "fulfillmentStatus": coalesce(fulfillmentStatus, "to_prepare"),
      shippedAt,
      deliveredAt,
      _createdAt
    }`,
  );

  const fulfillment: OpsFulfillmentMetrics = {
    toPrepare: 0,
    preparing: 0,
    shipped: 0,
    delivered: 0,
    avgHoursToShip: null,
    avgHoursToDeliver: null,
    sampleSizeShipped: 0,
    sampleSizeDelivered: 0,
  };

  for (const o of paidOrders) {
    const status = o.fulfillmentStatus ?? "to_prepare";
    if (status === "to_prepare") fulfillment.toPrepare += 1;
    else if (status === "preparing") fulfillment.preparing += 1;
    else if (status === "shipped") fulfillment.shipped += 1;
    else if (status === "delivered") fulfillment.delivered += 1;
  }

  // Tiempos: cruzar snapshots del período con timestamps de fulfillment del order.
  const orderIds = snapshots.map((s) => s.orderId);
  if (orderIds.length > 0) {
    const timingOrders = await client.fetch<
      {
        _id: string;
        shippedAt?: string;
        deliveredAt?: string;
      }[]
    >(
      `*[_type == "order" && _id in $ids]{ _id, shippedAt, deliveredAt }`,
      { ids: orderIds },
    );
    const byId = new Map(timingOrders.map((o) => [o._id, o]));
    const toShip: number[] = [];
    const toDeliver: number[] = [];
    for (const snap of snapshots) {
      const o = byId.get(snap.orderId);
      if (!o) continue;
      if (o.shippedAt) {
        const h = hoursBetween(snap.paidAt, o.shippedAt);
        if (h !== null) toShip.push(h);
      }
      if (o.deliveredAt) {
        const h = hoursBetween(snap.paidAt, o.deliveredAt);
        if (h !== null) toDeliver.push(h);
      }
    }
    fulfillment.avgHoursToShip = avg(toShip);
    fulfillment.avgHoursToDeliver = avg(toDeliver);
    fulfillment.sampleSizeShipped = toShip.length;
    fulfillment.sampleSizeDelivered = toDeliver.length;
  }

  return {
    from: range.from,
    to: range.to,
    sales: {
      orderCount,
      revenue,
      averageTicket,
      cogs,
      grossProfit,
      marginPct,
      missingCostItemCount,
      snapshotsWithMissingCost,
    },
    products: productRows,
    fulfillment,
  };
}
