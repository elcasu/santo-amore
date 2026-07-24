import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { listOpsOrders } from "@/lib/ops/orders";

export async function GET() {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  try {
    const orders = await listOpsOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[ops/orders]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los pedidos" },
      { status: 500 },
    );
  }
}
