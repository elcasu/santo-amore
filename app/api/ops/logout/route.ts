import { NextResponse } from "next/server";

import { opsCookieOptions } from "@/lib/ops-gate";

export async function POST(request: Request) {
  const opts = opsCookieOptions(0);
  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  const res = wantsJson
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/ops/login", request.url), 303);

  res.cookies.set(opts.name, "", { ...opts, maxAge: 0 });
  return res;
}
