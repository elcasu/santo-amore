"use client";

import { useEffect, useState } from "react";

import type { OpsSpecialDayAlert } from "@/lib/ops/special-days";

function dismissKey(alert: OpsSpecialDayAlert): string {
  return `sa_ops_special_${alert.key}_${alert.date.slice(0, 4)}`;
}

function wasDismissed(alert: OpsSpecialDayAlert): boolean {
  try {
    return sessionStorage.getItem(dismissKey(alert)) === "1";
  } catch {
    return false;
  }
}

function markDismissed(alert: OpsSpecialDayAlert) {
  try {
    sessionStorage.setItem(dismissKey(alert), "1");
  } catch {
    /* ignore */
  }
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

function daysLabel(alert: OpsSpecialDayAlert): string {
  if (alert.isToday) return "Es hoy";
  if (alert.daysUntil === 1) return "Mañana";
  return `Faltan ${alert.daysUntil} días`;
}

/**
 * Avisos de días especiales (Sanity opsSpecialDays) dentro de la ventana de anticipación.
 */
export function OpsSpecialDaysBanner() {
  const [alerts, setAlerts] = useState<OpsSpecialDayAlert[]>([]);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/ops/special-days");
        if (!res.ok) return;
        const data = (await res.json()) as { alerts?: OpsSpecialDayAlert[] };
        if (cancelled || !Array.isArray(data.alerts)) return;
        setAlerts(data.alerts.filter((a) => !wasDismissed(a)));
      } catch {
        /* silencioso: el banner no es crítico */
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = alerts.filter((a) => !hiddenKeys.has(a.key));
  if (visible.length === 0) return null;

  function dismiss(alert: OpsSpecialDayAlert) {
    markDismissed(alert);
    setHiddenKeys((prev) => new Set(prev).add(alert.key));
  }

  return (
    <div className="space-y-0 border-b border-outline-variant/40">
      {visible.map((alert) => (
        <div
          key={`${alert.key}-${alert.date}`}
          className={
            alert.priority === "high"
              ? "bg-primary/10 px-4 py-3"
              : "bg-surface-container px-4 py-3"
          }
        >
          <div className="mx-auto flex max-w-lg items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-semibold text-foreground">
                  {alert.title}
                </p>
                {alert.priority === "high" ? (
                  <span className="rounded bg-primary px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-on-primary">
                    Prioridad
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 font-sans text-xs text-secondary">
                {daysLabel(alert)}
                {" · "}
                {formatDateLabel(alert.date)}
              </p>
              {alert.hint ? (
                <p className="mt-1 font-sans text-xs leading-relaxed text-foreground/80">
                  {alert.hint}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(alert)}
              className="shrink-0 rounded px-2 py-2 font-sans text-xs text-secondary hover:text-foreground"
              aria-label={`Cerrar aviso de ${alert.title}`}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
