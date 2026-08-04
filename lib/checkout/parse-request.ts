import type {
  CheckoutCustomer,
  CheckoutShipping,
} from "@/lib/checkout/types";

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseCustomer(
  raw: Partial<CheckoutCustomer> | undefined,
): CheckoutCustomer | null {
  if (
    !raw ||
    !isNonEmptyString(raw.name) ||
    !isNonEmptyString(raw.email) ||
    !isNonEmptyString(raw.phone)
  ) {
    return null;
  }
  const email = raw.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return {
    name: raw.name.trim(),
    email,
    phone: raw.phone.trim(),
  };
}

export function parseShipping(
  raw: Partial<CheckoutShipping> | undefined,
): CheckoutShipping | null {
  if (
    !raw ||
    !isNonEmptyString(raw.address) ||
    !isNonEmptyString(raw.city) ||
    !isNonEmptyString(raw.province) ||
    !isNonEmptyString(raw.postalCode)
  ) {
    return null;
  }
  return {
    address: raw.address.trim(),
    city: raw.city.trim(),
    province: raw.province.trim(),
    postalCode: raw.postalCode.trim(),
    notes: isNonEmptyString(raw.notes) ? raw.notes.trim() : undefined,
  };
}
