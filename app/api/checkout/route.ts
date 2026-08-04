import { NextResponse } from "next/server";

import {
  attachPreferenceToOrder,
  createCheckoutPreference,
  createPendingOrder,
} from "@/lib/checkout/create-order";
import {
  parseCustomer,
  parseShipping,
} from "@/lib/checkout/parse-request";
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
