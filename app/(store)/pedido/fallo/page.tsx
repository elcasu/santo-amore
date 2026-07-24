import Link from "next/link";

export default function PedidoFalloPage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-24 text-center md:px-16">
      <p className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
        Pago no completado
      </p>
      <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        No pudimos procesar el pago
      </h1>
      <p className="mb-10 font-sans text-base leading-relaxed text-secondary">
        El pago fue rechazado o cancelado. Tu carrito sigue disponible para
        intentarlo de nuevo.
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center bg-foreground px-8 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
        >
          Reintentar checkout
        </Link>
        <Link
          href="/carrito"
          className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary"
        >
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}
