import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { listOpsProducts } from "@/lib/ops/products";

export async function GET() {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  try {
    const products = await listOpsProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[ops/products]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los productos" },
      { status: 500 },
    );
  }
}
