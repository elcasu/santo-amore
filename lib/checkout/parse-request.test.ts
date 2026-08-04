import { describe, expect, it } from "vitest";

import {
  isNonEmptyString,
  parseCustomer,
  parseShipping,
} from "@/lib/checkout/parse-request";

describe("isNonEmptyString", () => {
  it("accepts trimmed non-empty strings", () => {
    expect(isNonEmptyString("  ok ")).toBe(true);
  });

  it("rejects empty or non-strings", () => {
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString(1)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
  });
});

describe("parseCustomer", () => {
  it("returns trimmed valid customer", () => {
    expect(
      parseCustomer({
        name: "  Ana ",
        email: " ana@example.com ",
        phone: " 11 1234 ",
      }),
    ).toEqual({
      name: "Ana",
      email: "ana@example.com",
      phone: "11 1234",
    });
  });

  it("rejects missing fields or invalid email", () => {
    expect(parseCustomer(undefined)).toBeNull();
    expect(
      parseCustomer({ name: "Ana", email: "bad", phone: "1" }),
    ).toBeNull();
    expect(
      parseCustomer({ name: "", email: "a@b.com", phone: "1" }),
    ).toBeNull();
  });
});

describe("parseShipping", () => {
  it("returns trimmed shipping and optional notes", () => {
    expect(
      parseShipping({
        address: " Calle 1 ",
        city: " CABA ",
        province: " BA ",
        postalCode: " 1000 ",
        notes: "  Dejar en portería ",
      }),
    ).toEqual({
      address: "Calle 1",
      city: "CABA",
      province: "BA",
      postalCode: "1000",
      notes: "Dejar en portería",
    });
  });

  it("omits blank notes and rejects incomplete address", () => {
    expect(
      parseShipping({
        address: "Calle 1",
        city: "CABA",
        province: "BA",
        postalCode: "1000",
        notes: "   ",
      }),
    ).toEqual({
      address: "Calle 1",
      city: "CABA",
      province: "BA",
      postalCode: "1000",
      notes: undefined,
    });

    expect(
      parseShipping({
        address: "Calle 1",
        city: "CABA",
        province: "BA",
      }),
    ).toBeNull();
  });
});
