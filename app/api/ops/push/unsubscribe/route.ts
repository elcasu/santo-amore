import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { deletePushSubscriptionByEndpoint } from "@/lib/ops/push";

type Body = { endpoint?: string };

export async function POST(request: Request) {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  if (!endpoint) {
    return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });
  }

  try {
    await deletePushSubscriptionByEndpoint(endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ops/push/unsubscribe]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la suscripción" },
      { status: 500 },
    );
  }
}
