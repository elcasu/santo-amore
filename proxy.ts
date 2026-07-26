import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";
import {
  COOKIE_NAME,
  isSiteGateEnabled,
  isValidGateCookie,
} from "@/lib/site-gate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const opsGuard = await guardOpsRoutes(request, pathname);
  if (opsGuard) return opsGuard;

  if (!isSiteGateEnabled()) {
    return NextResponse.next();
  }

  if (
    pathname === "/acceso" ||
    pathname.startsWith("/api/acceso") ||
    pathname.startsWith("/api/mercadopago") ||
    pathname.startsWith("/api/ops") ||
    pathname.startsWith("/ops") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (await isValidGateCookie(token)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/acceso";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

async function guardOpsRoutes(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> {
  if (!isOpsGateEnabled()) {
    if (pathname === "/api/ops/cron/special-days-push") {
      return null;
    }
    if (pathname.startsWith("/ops") || pathname.startsWith("/api/ops")) {
      if (pathname.startsWith("/api/ops")) {
        return NextResponse.json(
          { error: "Ops no configurado (falta OPS_PASSWORD)" },
          { status: 503 },
        );
      }
      // Pages still render; login shows config error.
    }
    return null;
  }

  const isOpsPage = pathname.startsWith("/ops");
  const isOpsApi = pathname.startsWith("/api/ops");
  if (!isOpsPage && !isOpsApi) return null;

  const isPublic =
    pathname === "/ops/login" ||
    pathname === "/api/ops/login" ||
    pathname === "/api/ops/logout" ||
    pathname === "/api/ops/cron/special-days-push" ||
    pathname === "/ops/manifest.webmanifest" ||
    pathname === "/ops/sw.js";

  if (isPublic) return null;

  const token = request.cookies.get(OPS_COOKIE_NAME)?.value;
  if (await isValidOpsCookie(token)) return null;

  if (isOpsApi) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/ops/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Todo excepto estáticos comunes. Brand assets también pasan
     * para que /acceso pueda cargar logos si hace falta.
     */
    "/((?!_next/static|_next/image|brand/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
