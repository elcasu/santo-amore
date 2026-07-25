/**
 * One-shot: crea saleSnapshot para orders ya pagados que aún no tienen snapshot.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/backfill-sale-snapshots.ts
 *
 * Requiere SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_PROJECT_ID / DATASET.
 */

import {
  ensureSaleSnapshotForOrder,
  type OrderForSaleSnapshot,
} from "../lib/ops/sale-snapshot";
import { getWriteClient } from "../sanity/lib/write-client";

async function main() {
  const write = getWriteClient();

  const paidOrders = await write.fetch<
    (OrderForSaleSnapshot & { _createdAt: string })[]
  >(
    `*[_type == "order" && status == "paid" && count(*[_type == "saleSnapshot" && orderId == ^._id]) == 0]{
      _id,
      orderNumber,
      currency,
      _createdAt,
      items[]{ productId, sku, title, qty, unitPrice, unitCost },
      shipping{ city, province }
    }`,
  );

  console.log(`Orders paid sin snapshot: ${paidOrders.length}`);

  let created = 0;
  for (const order of paidOrders) {
    const result = await ensureSaleSnapshotForOrder(order, order._createdAt);
    if (result.created) {
      created += 1;
      console.log(`✓ ${order.orderNumber} → ${result.snapshotId}`);
    } else {
      console.log(`· ${order.orderNumber} ya existía`);
    }
  }

  console.log(`Listo. Creados: ${created}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
