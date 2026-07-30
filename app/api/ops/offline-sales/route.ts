import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import {
  createOfflineSale,
  listOfflineSales,
} from "@/lib/ops/offline-sales";
import { isOfflineSaleChannel } from "@/lib/ops/types";

export async function GET() {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  try {
    const sales = await listOfflineSales();
    return NextResponse.json({ sales });
  } catch (error) {
    console.error("[ops/offline-sales]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las ventas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  let body: {
    channel?: unknown;
    notes?: unknown;
    items?: unknown;
    paidAt?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isOfflineSaleChannel(body.channel)) {
    return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Agregá al menos un producto" },
      { status: 400 },
    );
  }

  const items: { productId: string; qty: number; unitPrice: number }[] = [];
  for (const raw of body.items) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Ítem inválido" }, { status: 400 });
    }
    const item = raw as {
      productId?: unknown;
      qty?: unknown;
      unitPrice?: unknown;
    };
    if (typeof item.productId !== "string" || !item.productId) {
      return NextResponse.json({ error: "productId inválido" }, { status: 400 });
    }
    if (
      typeof item.qty !== "number" ||
      !Number.isInteger(item.qty) ||
      item.qty < 1
    ) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }
    if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }
    items.push({
      productId: item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice,
    });
  }

  const notes =
    typeof body.notes === "string" ? body.notes.slice(0, 500) : undefined;
  const paidAt =
    typeof body.paidAt === "string" && body.paidAt ? body.paidAt : undefined;

  try {
    const sale = await createOfflineSale({
      channel: body.channel,
      notes,
      items,
      paidAt,
    });
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar la venta";
    const status = message.includes("no encontrado") ? 404 : 400;
    console.error("[ops/offline-sales/create]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
