import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { patchOpsProduct } from "@/lib/ops/products";
import { isCommerceStatus } from "@/lib/ops/types";
import type { CommerceStatus } from "@/lib/types/content";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id || id.includes("/")) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: {
    commerceStatus?: unknown;
    stockQty?: unknown;
    trackInventory?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const patch: {
    commerceStatus?: CommerceStatus;
    stockQty?: number;
    trackInventory?: boolean;
  } = {};

  if (body.commerceStatus !== undefined) {
    if (!isCommerceStatus(body.commerceStatus)) {
      return NextResponse.json(
        { error: "commerceStatus inválido" },
        { status: 400 },
      );
    }
    patch.commerceStatus = body.commerceStatus;
  }

  if (body.stockQty !== undefined) {
    if (
      typeof body.stockQty !== "number" ||
      !Number.isInteger(body.stockQty) ||
      body.stockQty < 0
    ) {
      return NextResponse.json(
        { error: "stockQty debe ser un entero ≥ 0" },
        { status: 400 },
      );
    }
    patch.stockQty = body.stockQty;
  }

  if (body.trackInventory !== undefined) {
    if (typeof body.trackInventory !== "boolean") {
      return NextResponse.json(
        { error: "trackInventory debe ser boolean" },
        { status: 400 },
      );
    }
    patch.trackInventory = body.trackInventory;
  }

  if (
    patch.commerceStatus === undefined &&
    patch.stockQty === undefined &&
    patch.trackInventory === undefined
  ) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  try {
    const product = await patchOpsProduct(id, patch);
    return NextResponse.json({ product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar";
    const status = message.includes("no encontrado") ? 404 : 500;
    console.error("[ops/products/patch]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
