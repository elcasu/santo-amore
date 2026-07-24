import { NextResponse } from "next/server";

import {
  attachPreferenceToOrder,
  createCheckoutPreference,
  createPendingOrder,
} from "@/lib/checkout/create-order";
import type {
  CheckoutCartLine,
  CheckoutCustomer,
  CheckoutShipping,
} from "@/lib/checkout/types";
import { validateCheckoutCart } from "@/lib/checkout/validate-cart";

type CheckoutBody = {
  items?: CheckoutCartLine[];
  customer?: Partial<CheckoutCustomer>;
  shipping?: Partial<CheckoutShipping>;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseCustomer(
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

function parseShipping(
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const customer = parseCustomer(body.customer);
    const shipping = parseShipping(body.shipping);

    if (!customer) {
      return NextResponse.json(
        { error: "Completá nombre, email y teléfono válidos." },
        { status: 400 },
      );
    }
    if (!shipping) {
      return NextResponse.json(
        { error: "Completá dirección, ciudad, provincia y código postal." },
        { status: 400 },
      );
    }

    const validated = await validateCheckoutCart(body.items ?? []);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { orderId, orderNumber, externalReference } =
      await createPendingOrder({
        items: validated.items,
        subtotal: validated.subtotal,
        customer,
        shipping,
      });

    const { preferenceId, initPoint } = await createCheckoutPreference({
      items: validated.items,
      customer,
      shipping,
      externalReference,
    });

    await attachPreferenceToOrder(orderId, preferenceId);

    return NextResponse.json({
      initPoint,
      orderNumber,
      preferenceId,
    });
  } catch (error) {
    console.error("[checkout]", error);
    const message =
      error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
