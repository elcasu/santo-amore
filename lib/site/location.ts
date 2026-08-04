export const DEFAULT_LOCATION_LABEL = "Mar del Plata, Argentina";
export const DEFAULT_COUNTRY_CODE = "AR";

/** Normaliza el label de ubicación del CMS; fallback de marca si viene vacío. */
export function resolveLocationLabel(label?: string | null): string {
  const trimmed = label?.trim();
  return trimmed || DEFAULT_LOCATION_LABEL;
}

/** Normaliza ISO 3166-1 alpha-2; fallback AR. */
export function resolveCountryCode(code?: string | null): string {
  const normalized = code?.trim().toUpperCase();
  if (!normalized || !/^[A-Z]{2}$/.test(normalized)) {
    return DEFAULT_COUNTRY_CODE;
  }
  return normalized;
}

/** Convierte un country code en emoji de bandera (regional indicators). */
export function flagEmojiFromCountryCode(code?: string | null): string {
  const cc = resolveCountryCode(code);
  const base = 0x1f1e6; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(
    base + cc.charCodeAt(0) - 65,
    base + cc.charCodeAt(1) - 65,
  );
}
