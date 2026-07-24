import { client } from "@/sanity/lib/client";
import { getWriteClient } from "@/sanity/lib/write-client";

import type { FulfillmentStatus, OpsOrder } from "./types";

const opsOrderProjection = `{
  _id,
  orderNumber,
  status,
  "fulfillmentStatus": coalesce(fulfillmentStatus, "to_prepare"),
  items[]{
    productId,
    title,
    slug,
    sku,
    qty,
    unitPrice
  },
  customer,
  shipping,
  subtotal,
  currency,
  _createdAt
}`;

const listQuery = `*[_type == "order"] | order(_createdAt desc)[0...50] ${opsOrderProjection}`;
const byIdQuery = `*[_type == "order" && _id == $id][0] ${opsOrderProjection}`;

export async function listOpsOrders(): Promise<OpsOrder[]> {
  const orders = await client.fetch<OpsOrder[]>(listQuery);
  return orders.sort((a, b) => {
    const paidRank = (s: string) => (s === "paid" ? 0 : 1);
    const byPaid = paidRank(a.status) - paidRank(b.status);
    if (byPaid !== 0) return byPaid;
    return b._createdAt.localeCompare(a._createdAt);
  });
}

export async function getOpsOrder(id: string): Promise<OpsOrder | null> {
  return client.fetch<OpsOrder | null>(byIdQuery, { id });
}

export async function patchOpsOrderFulfillment(
  id: string,
  fulfillmentStatus: FulfillmentStatus,
): Promise<OpsOrder> {
  const existing = await getOpsOrder(id);
  if (!existing) {
    throw new Error("Pedido no encontrado");
  }
  if (existing.status !== "paid") {
    throw new Error("Solo se puede actualizar fulfillment de pedidos pagados");
  }

  const write = getWriteClient();
  await write.patch(id).set({ fulfillmentStatus }).commit();

  const updated = await getOpsOrder(id);
  if (!updated) {
    throw new Error("Pedido no encontrado tras actualizar");
  }
  return updated;
}
