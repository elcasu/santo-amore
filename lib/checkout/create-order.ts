import { randomUUID } from "crypto";

import type {
  CheckoutCustomer,
  CheckoutShipping,
  ValidatedOrderItem,
} from "@/lib/checkout/types";
import { createPreferenceApi, getSiteUrl } from "@/lib/mercadopago/client";
import { getWriteClient } from "@/sanity/lib/write-client";

function orderNumberFromRef(externalReference: string): string {
  const short = externalReference.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SA-${short}`;
}

export async function createPendingOrder(input: {
  items: ValidatedOrderItem[];
  subtotal: number;
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
}): Promise<{ orderId: string; orderNumber: string; externalReference: string }> {
  const writeClient = getWriteClient();
  const externalReference = randomUUID();
  const orderNumber = orderNumberFromRef(externalReference);

  const doc = await writeClient.create({
    _type: "order",
    orderNumber,
    status: "pending",
    externalReference,
    items: input.items.map((item) => ({
      _type: "orderItem",
      _key: item.productId,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      sku: item.sku,
      qty: item.qty,
      unitPrice: item.unitPrice,
    })),
    customer: input.customer,
    shipping: {
      address: input.shipping.address,
      city: input.shipping.city,
      province: input.shipping.province,
      postalCode: input.shipping.postalCode,
      notes: input.shipping.notes || undefined,
    },
    subtotal: input.subtotal,
    currency: "ARS",
  });

  return {
    orderId: doc._id,
    orderNumber,
    externalReference,
  };
}

export async function attachPreferenceToOrder(
  orderId: string,
  mpPreferenceId: string,
): Promise<void> {
  const writeClient = getWriteClient();
  await writeClient.patch(orderId).set({ mpPreferenceId }).commit();
}

export async function createCheckoutPreference(input: {
  items: ValidatedOrderItem[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  externalReference: string;
}): Promise<{ preferenceId: string; initPoint: string }> {
  const siteUrl = getSiteUrl();
  const preference = createPreferenceApi();

  const result = await preference.create({
    body: {
      items: input.items.map((item) => ({
        id: item.productId,
        title: item.title,
        quantity: item.qty,
        unit_price: item.unitPrice,
        currency_id: "ARS",
      })),
      payer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: {
          number: input.customer.phone,
        },
        address: {
          street_name: input.shipping.address,
          zip_code: input.shipping.postalCode,
        },
      },
      external_reference: input.externalReference,
      back_urls: {
        success: `${siteUrl}/pedido/exito`,
        pending: `${siteUrl}/pedido/pendiente`,
        failure: `${siteUrl}/pedido/fallo`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago/webhook?source_news=webhooks`,
      statement_descriptor: "SANTO AMORE",
      metadata: {
        shipping_city: input.shipping.city,
        shipping_province: input.shipping.province,
        shipping_notes: input.shipping.notes ?? "",
      },
    },
  });

  const preferenceId = result.id;
  const initPoint = result.init_point ?? result.sandbox_init_point;

  if (!preferenceId || !initPoint) {
    throw new Error("MercadoPago no devolvió preference id / init_point.");
  }

  return { preferenceId, initPoint };
}
