"use client";

import { useCallback, useState, useTransition } from "react";

import type { OpsMetricsResult } from "@/lib/ops/metrics";

type Preset = "7d" | "30d" | "90d" | "custom";

function formatMoney(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatRoi(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(0)}%`;
}

function formatHours(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (value < 24) return `${value.toFixed(1)} h`;
  return `${(value / 24).toFixed(1)} d`;
}

export function MetricsPanel({
  initialMetrics,
}: {
  initialMetrics: OpsMetricsResult;
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState(initialMetrics.from);
  const [customTo, setCustomTo] = useState(initialMetrics.to);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(
    (next: { preset?: Preset; from?: string; to?: string }) => {
      startTransition(async () => {
        setError(null);
        const params = new URLSearchParams();
        if (next.preset && next.preset !== "custom") {
          params.set("preset", next.preset);
        } else if (next.from && next.to) {
          params.set("from", next.from);
          params.set("to", next.to);
        }
        try {
          const res = await fetch(`/api/ops/metrics?${params.toString()}`);
          const data = (await res.json()) as {
            metrics?: OpsMetricsResult;
            error?: string;
          };
          if (!res.ok || !data.metrics) {
            throw new Error(data.error || "No se pudieron cargar métricas");
          }
          setMetrics(data.metrics);
          setCustomFrom(data.metrics.from);
          setCustomTo(data.metrics.to);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error");
        }
      });
    },
    [],
  );

  function selectPreset(next: Preset) {
    setPreset(next);
    if (next !== "custom") {
      load({ preset: next });
    }
  }

  function applyCustom() {
    setPreset("custom");
    load({ from: customFrom, to: customTo });
  }

  const { sales, products, fulfillment } = metrics;

  return (
    <div className="mx-auto max-w-lg px-4 py-4 pb-10">
      <p className="mb-3 font-sans text-sm text-secondary">
        {metrics.from} → {metrics.to}
        {pending ? " · actualizando…" : null}
      </p>

      <div className="mb-4 flex flex-wrap gap-1">
        {(
          [
            ["7d", "7 días"],
            ["30d", "30 días"],
            ["90d", "90 días"],
            ["custom", "Rango"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => selectPreset(key)}
            className={`rounded px-3 py-2 font-display text-sm font-semibold transition-colors ${
              preset === key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-secondary hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 font-sans text-xs text-secondary">
            Desde
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded border border-outline-variant bg-white px-2 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 font-sans text-xs text-secondary">
            Hasta
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded border border-outline-variant bg-white px-2 py-2 text-sm text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={applyCustom}
            className="rounded bg-primary px-3 py-2 font-display text-sm font-semibold text-on-primary"
          >
            Aplicar
          </button>
        </div>
      ) : null}

      {error ? (
        <p
          className="mb-3 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {sales.snapshotsWithMissingCost > 0 ? (
        <p className="mb-4 rounded border border-outline-variant/60 bg-surface-container/50 px-3 py-2 font-sans text-sm text-secondary">
          {sales.snapshotsWithMissingCost} venta(s) sin costo completo — el
          margen/ROI puede estar incompleto. Cargá{" "}
          <span className="text-foreground">unitCost</span> en Studio.
        </p>
      ) : null}

      <section className="mb-6">
        <h2 className="mb-3 font-display text-lg font-bold text-foreground">
          Ventas
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Kpi label="Revenue" value={formatMoney(sales.revenue)} />
          <Kpi label="Pedidos" value={String(sales.orderCount)} />
          <Kpi label="Ticket medio" value={formatMoney(sales.averageTicket)} />
          <Kpi label="Margen %" value={formatPct(sales.marginPct)} />
          <Kpi label="Ganancia bruta" value={formatMoney(sales.grossProfit)} />
          <Kpi label="COGS" value={formatMoney(sales.cogs)} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-display text-lg font-bold text-foreground">
          Operaciones
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Kpi label="Por preparar" value={String(fulfillment.toPrepare)} />
          <Kpi label="Preparando" value={String(fulfillment.preparing)} />
          <Kpi label="Enviados" value={String(fulfillment.shipped)} />
          <Kpi label="Entregados" value={String(fulfillment.delivered)} />
          <Kpi
            label="Prom. a envío"
            value={formatHours(fulfillment.avgHoursToShip)}
            hint={
              fulfillment.sampleSizeShipped
                ? `n=${fulfillment.sampleSizeShipped} en el período`
                : "Sin timestamps aún"
            }
          />
          <Kpi
            label="Prom. a entrega"
            value={formatHours(fulfillment.avgHoursToDeliver)}
            hint={
              fulfillment.sampleSizeDelivered
                ? `n=${fulfillment.sampleSizeDelivered} en el período`
                : "Sin timestamps aún"
            }
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-lg font-bold text-foreground">
          Productos
        </h2>
        <p className="mb-3 font-sans text-xs text-secondary">
          ROI = ganancia bruta / COGS (solo con costo). Ranking por revenue.
        </p>
        {products.length === 0 ? (
          <p className="font-sans text-sm text-secondary">
            Sin ventas en este período.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/50">
            {products.map((row) => (
              <li key={row.productId} className="py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-base font-semibold text-foreground">
                    {row.title}
                  </p>
                  <p className="shrink-0 font-sans text-sm text-secondary">
                    {formatMoney(row.revenue)}
                  </p>
                </div>
                <p className="mt-0.5 font-sans text-sm text-secondary">
                  {row.units} u. · margen {formatPct(row.marginPct)} · ROI{" "}
                  {formatRoi(row.productRoi)}
                  {row.sku ? ` · ${row.sku}` : ""}
                </p>
                {row.lowMarginHighVolume ? (
                  <p className="mt-1 font-sans text-xs text-primary">
                    Alto volumen / margen bajo — revisar precio o costo
                  </p>
                ) : null}
                {row.missingCost ? (
                  <p className="mt-1 font-sans text-xs text-secondary">
                    Falta costo en el snapshot
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded bg-surface-container/60 px-3 py-3">
      <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-secondary">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 font-sans text-[11px] text-secondary">{hint}</p>
      ) : null}
    </div>
  );
}
