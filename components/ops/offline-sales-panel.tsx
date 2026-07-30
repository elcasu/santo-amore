"use client";

import { useMemo, useState, useTransition } from "react";

import type { OfflineSale } from "@/lib/ops/offline-sales";
import {
  OFFLINE_SALE_CHANNELS,
  SALE_CHANNEL_LABELS,
  type OfflineSaleChannel,
  type OpsSaleProduct,
} from "@/lib/ops/types";

type DraftLine = {
  key: string;
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
};

export function OfflineSalesPanel({
  initialProducts,
  initialSales,
}: {
  initialProducts: OpsSaleProduct[];
  initialSales: OfflineSale[];
}) {
  const [products] = useState(initialProducts);
  const [sales, setSales] = useState(initialSales);
  const [channel, setChannel] = useState<OfflineSaleChannel>("local");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [pickerQuery, setPickerQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const selectedIds = new Set(lines.map((l) => l.productId));
    return products
      .filter((p) => !selectedIds.has(p._id))
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, 12);
  }, [products, pickerQuery, lines]);

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0),
    [lines],
  );

  function addProduct(product: OpsSaleProduct) {
    setLines((prev) => [
      ...prev,
      {
        key: `${product._id}-${Date.now()}`,
        productId: product._id,
        title: product.title,
        qty: 1,
        unitPrice: typeof product.price === "number" ? product.price : 0,
      },
    ]);
    setPickerQuery("");
    setShowPicker(false);
  }

  function updateLine(key: string, patch: Partial<Pick<DraftLine, "qty" | "unitPrice">>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((line) => line.key !== key));
  }

  function submit() {
    if (lines.length === 0) {
      setError("Agregá al menos un producto");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/ops/offline-sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel,
            notes: notes.trim() || undefined,
            items: lines.map((line) => ({
              productId: line.productId,
              qty: line.qty,
              unitPrice: line.unitPrice,
            })),
          }),
        });
        const data = (await res.json()) as {
          sale?: OfflineSale;
          error?: string;
        };
        if (!res.ok || !data.sale) {
          throw new Error(data.error || "No se pudo registrar");
        }
        setSales((prev) => [data.sale!, ...prev]);
        setLines([]);
        setNotes("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <section className={pending ? "opacity-70" : undefined}>
        <h2 className="font-display text-lg font-bold text-foreground">
          Nueva venta
        </h2>
        <p className="mt-1 font-sans text-sm text-secondary">
          Feria, local, WhatsApp u otro — se descuenta stock y entra a métricas.
        </p>

        {error ? (
          <p
            className="mt-3 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <fieldset className="mt-4">
          <legend className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
            Canal
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {OFFLINE_SALE_CHANNELS.map((value) => {
              const active = channel === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={pending}
                  onClick={() => setChannel(value)}
                  className={`rounded px-3 py-2.5 font-display text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-foreground hover:bg-surface-container-high"
                  }`}
                >
                  {SALE_CHANNEL_LABELS[value]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
              Productos
            </h3>
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowPicker((v) => !v)}
              className="font-sans text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              {showPicker ? "Cerrar" : "+ Agregar"}
            </button>
          </div>

          {showPicker ? (
            <div className="mb-3 rounded border border-outline-variant/50 bg-surface-container/40 p-3">
              <input
                type="search"
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Buscar por nombre o SKU"
                className="w-full rounded border border-outline-variant/60 bg-surface px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-primary"
                autoFocus
              />
              <ul className="mt-2 max-h-48 overflow-y-auto divide-y divide-outline-variant/40">
                {filteredProducts.map((product) => (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="flex w-full items-baseline justify-between gap-2 py-2 text-left hover:bg-surface/80"
                    >
                      <span className="font-sans text-sm text-foreground">
                        {product.title}
                      </span>
                      <span className="shrink-0 font-sans text-sm text-secondary">
                        {formatMoney(product.price)}
                      </span>
                    </button>
                  </li>
                ))}
                {filteredProducts.length === 0 ? (
                  <li className="py-3 text-center font-sans text-sm text-secondary">
                    Sin resultados
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {lines.length === 0 ? (
            <p className="py-3 font-sans text-sm text-secondary">
              Todavía no hay ítems.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/50">
              {lines.map((line) => (
                <li key={line.key} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-foreground">
                      {line.title}
                    </p>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => removeLine(line.key)}
                      className="shrink-0 font-sans text-xs text-secondary underline-offset-2 hover:text-primary hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="font-sans text-[11px] uppercase tracking-wide text-secondary">
                        Cantidad
                      </span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={line.qty}
                        disabled={pending}
                        onChange={(e) => {
                          const qty = Math.max(1, Math.floor(Number(e.target.value) || 1));
                          updateLine(line.key, { qty });
                        }}
                        className="mt-1 w-full rounded border border-outline-variant/60 bg-surface px-3 py-2 font-sans text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="block">
                      <span className="font-sans text-[11px] uppercase tracking-wide text-secondary">
                        Precio unit.
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={line.unitPrice}
                        disabled={pending}
                        onChange={(e) => {
                          const unitPrice = Math.max(0, Number(e.target.value) || 0);
                          updateLine(line.key, { unitPrice });
                        }}
                        className="mt-1 w-full rounded border border-outline-variant/60 bg-surface px-3 py-2 font-sans text-sm outline-none focus:border-primary"
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="mt-4 block">
          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
            Nota (opcional)
          </span>
          <input
            type="text"
            value={notes}
            disabled={pending}
            maxLength={500}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. mesa 3, descuento amiga…"
            className="mt-2 w-full rounded border border-outline-variant/60 bg-surface px-3 py-2.5 font-sans text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-display text-lg font-bold text-foreground">
            {formatMoney(total)}
          </p>
          <button
            type="button"
            disabled={pending || lines.length === 0}
            onClick={submit}
            className="rounded bg-primary px-5 py-3 font-display text-sm font-semibold text-on-primary transition-opacity disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Registrar venta"}
          </button>
        </div>
      </section>

      <section className="mt-10 border-t border-outline-variant/40 pt-6">
        <h2 className="font-display text-lg font-bold text-foreground">
          Recientes
        </h2>
        <p className="mt-1 mb-4 font-sans text-sm text-secondary">
          {sales.length} venta{sales.length === 1 ? "" : "s"} offline
        </p>
        <ul className="divide-y divide-outline-variant/50">
          {sales.map((sale) => (
            <li key={sale._id} className="py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-base font-semibold text-foreground">
                  {sale.orderNumber}
                </span>
                <span className="font-sans text-sm text-secondary">
                  {formatMoney(sale.revenue)}
                </span>
              </div>
              <p className="mt-0.5 font-sans text-sm text-secondary">
                {SALE_CHANNEL_LABELS[sale.channel]} · {formatDate(sale.paidAt)}
              </p>
              <p className="mt-1 font-sans text-sm text-foreground">
                {(sale.items || [])
                  .map((item) => `${item.qty ?? 0}× ${item.title || "Ítem"}`)
                  .join(", ")}
              </p>
              {sale.notes ? (
                <p className="mt-1 font-sans text-sm text-secondary">{sale.notes}</p>
              ) : null}
            </li>
          ))}
          {sales.length === 0 ? (
            <li className="py-8 text-center font-sans text-sm text-secondary">
              Todavía no hay ventas offline.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function formatMoney(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
