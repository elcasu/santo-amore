export type MercadoPagoWebhookAuth =
  | { action: "verify"; secret: string }
  | { action: "skip" }
  | { action: "reject_misconfigured" };

/**
 * Production (VERCEL_ENV=production) exige secret.
 * Local / preview pueden omitirlo (warn en el route).
 */
export function resolveMercadoPagoWebhookAuth(input: {
  secret: string | undefined;
  vercelEnv: string | undefined;
}): MercadoPagoWebhookAuth {
  const secret = input.secret?.trim() ?? "";
  if (secret) {
    return { action: "verify", secret };
  }
  if (input.vercelEnv === "production") {
    return { action: "reject_misconfigured" };
  }
  return { action: "skip" };
}
