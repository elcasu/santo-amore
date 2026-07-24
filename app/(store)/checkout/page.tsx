import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[960px] px-5 py-16 md:px-16">
      <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Checkout
      </h1>
      <p className="mb-10 font-sans text-sm text-secondary">
        Completá tus datos para continuar el pago.
      </p>
      <CheckoutForm />
    </div>
  );
}
