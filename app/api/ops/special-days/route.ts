import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { getOpsSpecialDayAlerts } from "@/lib/ops/special-days";

export async function GET() {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  try {
    const alerts = await getOpsSpecialDayAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("[ops/special-days]", error);
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar los días especiales";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
