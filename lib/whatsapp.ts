/** Digits only (E.164 without +), e.g. 54911… */
export function normalizeWhatsAppPhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function getWhatsAppPhone(): string | null {
  return normalizeWhatsAppPhone(process.env.NEXT_PUBLIC_WHATSAPP_PHONE);
}

export function getWhatsAppPrefill(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_PREFILL?.trim() ||
    "Hola, consulta desde la web de Santo Amore."
  );
}

/** Public chat link for the brand number (store CTAs). */
export function buildWhatsAppUrl(options?: {
  phone?: string | null;
  text?: string | null;
}): string | null {
  const phone = normalizeWhatsAppPhone(
    options?.phone ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE,
  );
  if (!phone) return null;

  const text =
    options?.text === undefined
      ? getWhatsAppPrefill()
      : options.text?.trim() || "";

  const base = `https://wa.me/${phone}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function getOpsInboxUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_OPS_INBOX_URL?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Display-friendly phone (spaces every 2–4 digits for readability). */
export function formatPhoneDisplay(raw: string | undefined | null): string | null {
  const digits = normalizeWhatsAppPhone(raw);
  if (!digits) return raw?.trim() || null;
  if (digits.startsWith("54") && digits.length >= 12) {
    const rest = digits.slice(2);
    return `+54 ${rest.slice(0, 3)} ${rest.slice(3, 6)}-${rest.slice(6)}`;
  }
  return `+${digits}`;
}
