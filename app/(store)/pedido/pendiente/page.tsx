import Link from "next/link";

export default function PedidoPendientePage() {
  return (
    <div className="mx-auto max-w-[640px] px-5 py-24 text-center md:px-16">
      <p className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-secondary">
        Pago pendiente
      </p>
      <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Estamos esperando la confirmación
      </h1>
      <p className="mb-10 font-sans text-base leading-relaxed text-secondary">
        Tu pago todavía no está acreditado. Cuando MercadoPago lo confirme, te
        avisamos. Si ya pagaste, no hace falta repetir la compra.
      </p>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/carrito"
          className="inline-flex items-center justify-center border border-foreground px-8 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground hover:text-white"
        >
          Ver carrito
        </Link>
        <Link
          href="/contacto"
          className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary"
        >
          Contacto
        </Link>
      </div>
    </div>
  );
}
