/**
 * Evita open redirects: solo paths relativos internos.
 * `allow` puede restringir a un subárbol (p.ej. /ops).
 */
export function sanitizeNext(
  raw: string | undefined,
  options: {
    fallback: string;
    allow?: (path: string) => boolean;
  },
): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return options.fallback;
  }
  if (options.allow && !options.allow(raw)) {
    return options.fallback;
  }
  return raw;
}

export function sanitizeSiteNext(raw: string | undefined): string {
  return sanitizeNext(raw, {
    fallback: "/",
    allow: (path) => !path.startsWith("/acceso"),
  });
}

export function sanitizeOpsNext(raw: string | undefined): string {
  return sanitizeNext(raw, {
    fallback: "/ops",
    allow: (path) => path.startsWith("/ops") && !path.startsWith("/ops/login"),
  });
}
