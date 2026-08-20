import { afterEach, describe, expect, it } from "vitest";

import {
  buildWhatsAppUrl,
  formatPhoneDisplay,
  getOpsInboxUrl,
  normalizeWhatsAppPhone,
  productWhatsAppText,
} from "@/lib/whatsapp";

describe("normalizeWhatsAppPhone", () => {
  it("strips non-digits and requires min length", () => {
    expect(normalizeWhatsAppPhone("+54 9 11 1234-5678")).toBe("5491112345678");
    expect(normalizeWhatsAppPhone("123")).toBeNull();
    expect(normalizeWhatsAppPhone(null)).toBeNull();
  });
});

describe("buildWhatsAppUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
    delete process.env.NEXT_PUBLIC_WHATSAPP_PREFILL;
  });

  it("builds wa.me URL with explicit phone and text", () => {
    expect(
      buildWhatsAppUrl({ phone: "5491112345678", text: "Hola" }),
    ).toBe("https://wa.me/5491112345678?text=Hola");
  });

  it("returns bare link when text is empty string", () => {
    expect(
      buildWhatsAppUrl({ phone: "5491112345678", text: "" }),
    ).toBe("https://wa.me/5491112345678");
  });

  it("returns null without phone", () => {
    expect(buildWhatsAppUrl({ text: "Hola" })).toBeNull();
  });
});

describe("formatPhoneDisplay", () => {
  it("formats AR numbers", () => {
    expect(formatPhoneDisplay("5491112345678")).toBe("+54 911 123-45678");
  });

  it("falls back for short/other values", () => {
    expect(formatPhoneDisplay("123")).toBe("123");
    expect(formatPhoneDisplay("491234567890")).toBe("+491234567890");
  });
});

describe("getOpsInboxUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_OPS_INBOX_URL;
  });

  it("accepts http(s) URLs", () => {
    process.env.NEXT_PUBLIC_OPS_INBOX_URL = "https://inbox.example.com/app";
    expect(getOpsInboxUrl()).toBe("https://inbox.example.com/app");
  });

  it("rejects invalid protocols", () => {
    process.env.NEXT_PUBLIC_OPS_INBOX_URL = "javascript:alert(1)";
    expect(getOpsInboxUrl()).toBeNull();
  });
});

describe("productWhatsAppText", () => {
  it("varies copy by purchase status", () => {
    expect(productWhatsAppText("Bowl Atrium", "made_to_order")).toBe(
      "Hola, quiero encargar Bowl Atrium.",
    );
    expect(productWhatsAppText("Set Teiger", "coming_soon")).toBe(
      "Hola, avisame cuando esté disponible Set Teiger.",
    );
    expect(productWhatsAppText("Bandeja", "sold_out")).toBe(
      "Hola, consulto por Bandeja.",
    );
    expect(productWhatsAppText("Aurelia", "available")).toBe(
      "Hola, consulta por Aurelia.",
    );
  });
});
