import { NextResponse } from "next/server";

import { requireOpsSession } from "@/lib/ops/auth";
import { getVapidPublicKey, isPushConfigured } from "@/lib/ops/push";

export async function GET() {
  const auth = await requireOpsSession();
  if (!auth.ok) return auth.response;

  if (!isPushConfigured()) {
    return NextResponse.json(
      { configured: false, publicKey: null },
      { status: 200 },
    );
  }

  return NextResponse.json({
    configured: true,
    publicKey: getVapidPublicKey(),
  });
}
