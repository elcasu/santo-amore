import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifica firma x-signature de webhooks MercadoPago.
 * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | undefined;
  secret: string;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = input;
  if (!xSignature || !xRequestId || !dataId || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  ) as Record<string, string | undefined>;

  const ts = parts.ts;
  const hash = parts.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(hash, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
