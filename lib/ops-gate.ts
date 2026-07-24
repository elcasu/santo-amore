const COOKIE_NAME = "sa_ops_gate";

export function isOpsGateEnabled(): boolean {
  return Boolean(process.env.OPS_PASSWORD);
}

export function getOpsPassword(): string | undefined {
  return process.env.OPS_PASSWORD || undefined;
}

export async function hashOpsToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`santo-amore:ops-gate:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidOpsCookie(
  cookieValue: string | undefined,
): Promise<boolean> {
  const password = getOpsPassword();
  if (!password || !cookieValue) return false;
  const expected = await hashOpsToken(password);
  return timingSafeEqual(cookieValue, expected);
}

/** path `/` so the cookie covers both `/ops` and `/api/ops`. */
export function opsCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 30) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.VERCEL === "1",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { COOKIE_NAME as OPS_COOKIE_NAME };

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
