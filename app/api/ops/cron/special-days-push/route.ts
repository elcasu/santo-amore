import { NextResponse } from "next/server";

import { dispatchSpecialDayPushes, isPushConfigured } from "@/lib/ops/push";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/**
 * Cron diario (Vercel): envía pushes de días especiales según lead + repeat.
 * Auth: Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Push no configurado (faltan VAPID keys)" },
      { status: 503 },
    );
  }

  try {
    const result = await dispatchSpecialDayPushes();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[ops/cron/special-days-push]", error);
    const message =
      error instanceof Error ? error.message : "Error enviando pushes";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
