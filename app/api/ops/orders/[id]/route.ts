import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { patchOpsOrderFulfillment } from "@/lib/ops/orders";
import { isFulfillmentStatus } from "@/lib/ops/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id || id.includes("/")) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { fulfillmentStatus?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isFulfillmentStatus(body.fulfillmentStatus)) {
    return NextResponse.json(
      { error: "fulfillmentStatus inválido" },
      { status: 400 },
    );
  }

  try {
    const order = await patchOpsOrderFulfillment(id, body.fulfillmentStatus);
    return NextResponse.json({ order });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar";
    const status = message.includes("no encontrado")
      ? 404
      : message.includes("pagados")
        ? 400
        : 500;
    console.error("[ops/orders/patch]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
