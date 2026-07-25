import Link from "next/link";

import { isOpsGateEnabled } from "@/lib/ops-gate";

export function OpsNav({
  active,
}: {
  active: "products" | "orders" | "metrics";
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant/40 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Ops
          </p>
          <p className="font-display text-lg font-bold leading-tight text-foreground">
            Santo Amore
          </p>
        </div>
        {isOpsGateEnabled() ? (
          <form action="/api/ops/logout" method="post">
            <button
              type="submit"
              className="rounded px-3 py-2 font-sans text-sm text-secondary underline-offset-2 hover:text-foreground hover:underline"
            >
              Salir
            </button>
          </form>
        ) : null}
      </div>
      <nav className="mx-auto flex max-w-lg gap-1 px-4 pb-3">
        <NavTab href="/ops" label="Productos" active={active === "products"} />
        <NavTab
          href="/ops/pedidos"
          label="Pedidos"
          active={active === "orders"}
        />
        <NavTab
          href="/ops/metricas"
          label="Métricas"
          active={active === "metrics"}
        />
      </nav>
    </header>
  );
}

function NavTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 rounded px-3 py-2.5 text-center font-display text-sm font-semibold transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
