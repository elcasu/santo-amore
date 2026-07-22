import { NextResponse } from "next/server";

import {
  gateCookieOptions,
  getSitePassword,
  hashGateToken,
  isSiteGateEnabled,
} from "@/lib/site-gate";

export async function POST(request: Request) {
  if (!isSiteGateEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const password = getSitePassword();
  if (!password) {
    return NextResponse.json({ error: "Gate no configurado" }, { status: 500 });
  }

  const contentType = request.headers.get("content-type") || "";
  let submitted = "";
  let nextPath = "/";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { password?: string; next?: string };
    submitted = body.password ?? "";
    nextPath = sanitizeNext(body.next);
  } else {
    const form = await request.formData();
    submitted = String(form.get("password") ?? "");
    nextPath = sanitizeNext(String(form.get("next") ?? "/"));
  }

  if (submitted !== password) {
    const url = new URL("/acceso", request.url);
    url.searchParams.set("error", "1");
    if (nextPath !== "/") url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, 303);
  }

  const token = await hashGateToken(password);
  const opts = gateCookieOptions();
  const res = NextResponse.redirect(new URL(nextPath, request.url), 303);
  res.cookies.set(opts.name, token, opts);
  return res;
}

function sanitizeNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/acceso")) return "/";
  return raw;
}
