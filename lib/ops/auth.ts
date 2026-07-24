import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getOpsPassword,
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";

export async function requireOpsSession(): Promise<
  { ok: true } | { ok: false; response: NextResponse }
> {
  if (!isOpsGateEnabled() || !getOpsPassword()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Ops no configurado (falta OPS_PASSWORD)" },
        { status: 503 },
      ),
    };
  }

  const jar = await cookies();
  const token = jar.get(OPS_COOKIE_NAME)?.value;
  if (!(await isValidOpsCookie(token))) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  return { ok: true };
}
