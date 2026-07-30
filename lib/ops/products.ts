import type { CommerceStatus } from "@/lib/types/content";
import { freshClient } from "@/sanity/lib/client";
import { getWriteClient } from "@/sanity/lib/write-client";

import type { OpsProduct, OpsSaleProduct } from "./types";

const opsProductProjection = `{
  _id,
  title,
  sku,
  "commerceStatus": coalesce(commerceStatus, "available"),
  "trackInventory": coalesce(trackInventory, false),
  stockQty,
  "mainImage": mainImage{
    "src": asset->url,
    "alt": alt
  }
}`;

const opsSaleProductProjection = `{
  _id,
  title,
  sku,
  price,
  unitCost,
  "commerceStatus": coalesce(commerceStatus, "available"),
  "trackInventory": coalesce(trackInventory, false),
  stockQty,
  "mainImage": mainImage{
    "src": asset->url,
    "alt": alt
  }
}`;

const listQuery = `*[_type == "product"] | order(title asc) ${opsProductProjection}`;
const listSaleQuery = `*[_type == "product"] | order(title asc) ${opsSaleProductProjection}`;
const byIdQuery = `*[_type == "product" && _id == $id][0] ${opsProductProjection}`;
const byIdSaleQuery = `*[_type == "product" && _id == $id][0] ${opsSaleProductProjection}`;

export async function listOpsProducts(): Promise<OpsProduct[]> {
  return freshClient.fetch<OpsProduct[]>(listQuery);
}

export async function listOpsSaleProducts(): Promise<OpsSaleProduct[]> {
  return freshClient.fetch<OpsSaleProduct[]>(listSaleQuery);
}

export async function getOpsProduct(id: string): Promise<OpsProduct | null> {
  return freshClient.fetch<OpsProduct | null>(byIdQuery, { id });
}

export async function getOpsSaleProduct(
  id: string,
): Promise<OpsSaleProduct | null> {
  return getWriteClient().fetch<OpsSaleProduct | null>(byIdSaleQuery, { id });
}

export async function patchOpsProduct(
  id: string,
  patch: {
    commerceStatus?: CommerceStatus;
    stockQty?: number;
    trackInventory?: boolean;
  },
): Promise<OpsProduct> {
  const existing = await getOpsProduct(id);
  if (!existing) {
    throw new Error("Producto no encontrado");
  }

  const write = getWriteClient();
  const set: Record<string, unknown> = {};

  if (patch.commerceStatus !== undefined) {
    set.commerceStatus = patch.commerceStatus;
  }
  if (patch.trackInventory !== undefined) {
    set.trackInventory = patch.trackInventory;
  }
  if (patch.stockQty !== undefined) {
    set.stockQty = patch.stockQty;
    set.trackInventory = true;
  }

  if (Object.keys(set).length === 0) {
    return existing;
  }

  await write.patch(id).set(set).commit();
  const updated = await getOpsProduct(id);
  if (!updated) {
    throw new Error("Producto no encontrado tras actualizar");
  }
  return updated;
}
