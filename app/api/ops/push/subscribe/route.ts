import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { isPushConfigured, savePushSubscription } from "@/lib/ops/push";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push no configurado (faltan VAPID keys)" },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const authKey = body.keys?.auth?.trim();

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json(
      { error: "Faltan endpoint o keys" },
      { status: 400 },
    );
  }

  try {
    const saved = await savePushSubscription({
      endpoint,
      keys: { p256dh, auth: authKey },
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    console.error("[ops/push/subscribe]", error);
    const message =
      error instanceof Error ? error.message : "No se pudo guardar la suscripción";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
