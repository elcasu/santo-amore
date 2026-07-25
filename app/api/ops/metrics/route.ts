import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { getOpsMetrics, resolveMetricsRange } from "@/lib/ops/metrics";

export async function GET(request: Request) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const preset = url.searchParams.get("preset");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    const range = resolveMetricsRange({ preset, from, to });
    const metrics = await getOpsMetrics(range);
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("[ops/metrics]", error);
    const message =
      error instanceof Error ? error.message : "No se pudieron cargar métricas";
    const status = message.includes("Fecha inválida") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
