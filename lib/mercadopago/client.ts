import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

export function getMercadoPagoAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado.");
  }
  return token;
}

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL no configurado (necesario para back_urls de MercadoPago).",
    );
  }
  return url.startsWith("http") ? url : `https://${url}`;
}

export function createMercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: getMercadoPagoAccessToken(),
  });
}

export function createPreferenceApi() {
  return new Preference(createMercadoPagoClient());
}

export function createPaymentApi() {
  return new Payment(createMercadoPagoClient());
}
