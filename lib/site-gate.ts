const COOKIE_NAME = "sa_site_gate";

/** Activo solo si hay password y no estamos en producción Vercel. */
export function isSiteGateEnabled(): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}

export function getSitePassword(): string | undefined {
  return process.env.SITE_PASSWORD || undefined;
}

export async function hashGateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`santo-amore:site-gate:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidGateCookie(
  cookieValue: string | undefined,
): Promise<boolean> {
  const password = getSitePassword();
  if (!password || !cookieValue) return false;
  const expected = await hashGateToken(password);
  return timingSafeEqual(cookieValue, expected);
}

export function gateCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 14) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    // En Vercel siempre HTTPS; en local http la cookie debe poder setearse
    secure: process.env.VERCEL === "1",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { COOKIE_NAME };

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
