import { NextResponse } from "next/server";

import type { OrderStatus } from "@/lib/checkout/types";
import { createPaymentApi } from "@/lib/mercadopago/client";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago/verify-signature";
import {
  ensureSaleSnapshotForOrder,
  fetchOrderForSaleSnapshot,
} from "@/lib/ops/sale-snapshot";
import { getWriteClient } from "@/sanity/lib/write-client";

function mapPaymentStatus(status: string | undefined): OrderStatus | null {
  switch (status) {
    case "approved":
      return "paid";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      // pending / in_process / etc. — keep order pending
      return null;
  }
}

async function findOrderByExternalReference(externalReference: string) {
  const writeClient = getWriteClient();
  return writeClient.fetch<{ _id: string; status: string } | null>(
    `*[_type == "order" && externalReference == $ref][0]{ _id, status }`,
    { ref: externalReference },
  );
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const queryId = url.searchParams.get("data.id") ?? undefined;
    const queryTopic = url.searchParams.get("type") ?? url.searchParams.get("topic");

    let body: { type?: string; action?: string; data?: { id?: string } } = {};
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = (await request.json()) as typeof body;
    }

    const dataId = String(body.data?.id ?? queryId ?? "");
    const topic = body.type ?? queryTopic;

    if (!dataId || (topic && topic !== "payment")) {
      // Ack non-payment topics so MP stops retrying
      return NextResponse.json({ ok: true, skipped: true });
    }

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (secret) {
      const valid = verifyMercadoPagoSignature({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
      });
      if (!valid) {
        console.warn("[mp-webhook] firma inválida");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn(
        "[mp-webhook] MERCADOPAGO_WEBHOOK_SECRET no seteado — se omite verificación",
      );
    }

    const paymentApi = createPaymentApi();
    const payment = await paymentApi.get({ id: dataId });
    const externalReference = payment.external_reference;
    if (!externalReference) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const order = await findOrderByExternalReference(externalReference);
    if (!order) {
      console.warn("[mp-webhook] order no encontrada", externalReference);
      return NextResponse.json({ ok: true, missing: true });
    }

    const nextStatus = mapPaymentStatus(payment.status);
    const writeClient = getWriteClient();
    const patch = writeClient
      .patch(order._id)
      .set({ mpPaymentId: String(payment.id ?? dataId) });

    if (nextStatus && order.status !== "paid") {
      patch.set({ status: nextStatus });
    }

    await patch.commit();

    // Hecho analítico inmutable: solo cuando el pago está aprobado.
    if (nextStatus === "paid" || order.status === "paid") {
      const fullOrder = await fetchOrderForSaleSnapshot(order._id);
      if (fullOrder) {
        const paidAt =
          typeof payment.date_approved === "string"
            ? payment.date_approved
            : new Date().toISOString();
        await ensureSaleSnapshotForOrder(fullOrder, paidAt);
      } else {
        console.warn("[mp-webhook] no se pudo leer order para saleSnapshot", order._id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mp-webhook]", error);
    // Return 200 on transient errors carefully — MP retries on non-2xx.
    // Prefer 500 so MP retries if Sanity/MP fetch failed.
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}

/** MP sometimes probes with GET */
export async function GET() {
  return NextResponse.json({ ok: true });
}
