import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  COOKIE_NAME,
  isSiteGateEnabled,
  isValidGateCookie,
} from "@/lib/site-gate";

export async function proxy(request: NextRequest) {
  if (!isSiteGateEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === "/acceso" ||
    pathname.startsWith("/api/acceso") ||
    pathname.startsWith("/api/mercadopago") ||
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

export const config = {
  matcher: [
    /*
     * Todo excepto estáticos comunes. Brand assets también pasan
     * para que /acceso pueda cargar logos si hace falta.
     */
    "/((?!_next/static|_next/image|brand/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
