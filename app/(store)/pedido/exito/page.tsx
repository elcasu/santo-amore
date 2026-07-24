import Link from "next/link";

import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";

export default function PedidoExitoPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-24 text-center md:px-16">
      <ClearCartOnMount />
      <p className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
        Pago aprobado
      </p>
      <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Gracias por tu compra
      </h1>
      <p className="mb-10 font-sans text-base leading-relaxed text-secondary">
        Recibimos tu pago. Te vamos a contactar para coordinar el envío.
      </p>
      <Link
        href="/catalogo"
        className="inline-flex items-center justify-center bg-foreground px-8 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
      >
        Seguir explorando
      </Link>
    </div>
  );
}
