import { NextResponse } from "next/server";

import {
  getOpsPassword,
  hashOpsToken,
  isOpsGateEnabled,
  opsCookieOptions,
} from "@/lib/ops-gate";

export async function POST(request: Request) {
  if (!isOpsGateEnabled()) {
    return NextResponse.json(
      { error: "Ops no configurado (falta OPS_PASSWORD)" },
      { status: 503 },
    );
  }

  const password = getOpsPassword();
  if (!password) {
    return NextResponse.json(
      { error: "Ops no configurado (falta OPS_PASSWORD)" },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let submitted = "";
  let nextPath = "/ops";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string; next?: string };
    submitted = body.password ?? "";
    nextPath = sanitizeNext(body.next);
  } else {
    const form = await request.formData();
    submitted = String(form.get("password") ?? "");
    nextPath = sanitizeNext(String(form.get("next") ?? "/ops"));
  }

  if (submitted !== password) {
    const url = new URL("/ops/login", request.url);
    url.searchParams.set("error", "1");
    if (nextPath !== "/ops") url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, 303);
  }

  const token = await hashOpsToken(password);
  const opts = opsCookieOptions();
  const res = NextResponse.redirect(new URL(nextPath, request.url), 303);
  res.cookies.set(opts.name, token, opts);
  return res;
}

function sanitizeNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/ops";
  if (!raw.startsWith("/ops") || raw.startsWith("/ops/login")) return "/ops";
  return raw;
}
