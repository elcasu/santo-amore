"use client";

import { useMemo, useState, useTransition } from "react";

import {
  FULFILLMENT_STATUSES,
  FULFILLMENT_STATUS_LABELS,
  type FulfillmentStatus,
  type OpsOrder,
} from "@/lib/ops/types";

const PAYMENT_LABELS: Record<OpsOrder["status"], string> = {
  pending: "Pendiente",
  paid: "Pagado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

export function OrdersPanel({ initialOrders }: { initialOrders: OpsOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = selectedId
    ? (orders.find((o) => o._id === selectedId) ?? null)
    : null;

  const paidCount = useMemo(
    () => orders.filter((o) => o.status === "paid").length,
    [orders],
  );

  async function patchFulfillment(id: string, fulfillmentStatus: FulfillmentStatus) {
    setError(null);
    const res = await fetch(`/api/ops/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus }),
    });
    const data = (await res.json()) as { order?: OpsOrder; error?: string };
    if (!res.ok || !data.order) {
      throw new Error(data.error || "No se pudo actualizar");
    }
    setOrders((prev) => prev.map((o) => (o._id === id ? data.order! : o)));
  }

  function updateFulfillment(status: FulfillmentStatus) {
    if (!selected) return;
    startTransition(async () => {
      try {
        await patchFulfillment(selected._id, status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <p className="mb-4 font-sans text-sm text-secondary">
        {orders.length} recientes · {paidCount} pagados
      </p>

      {error ? (
        <p
          className="mb-3 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {selected ? (
        <OrderDetail
          order={selected}
          pending={pending}
          onBack={() => setSelectedId(null)}
          onFulfillment={updateFulfillment}
        />
      ) : (
        <ul className="divide-y divide-outline-variant/50">
          {orders.map((order) => (
            <li key={order._id}>
              <button
                type="button"
                onClick={() => setSelectedId(order._id)}
                className="flex w-full flex-col gap-1 py-3 text-left transition-colors hover:bg-surface-container/60"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-base font-semibold text-foreground">
                    {order.orderNumber}
                  </span>
                  <span className="font-sans text-sm text-secondary">
                    {formatMoney(order.subtotal)}
                  </span>
                </div>
                <p className="font-sans text-sm text-secondary">
                  {PAYMENT_LABELS[order.status]}
                  {order.status === "paid"
                    ? ` · ${FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}`
                    : ""}
                  {" · "}
                  {order.customer?.name || "Sin nombre"}
                </p>
              </button>
            </li>
          ))}
          {orders.length === 0 ? (
            <li className="py-8 text-center font-sans text-sm text-secondary">
              Todavía no hay pedidos.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function OrderDetail({
  order,
  pending,
  onBack,
  onFulfillment,
}: {
  order: OpsOrder;
  pending: boolean;
  onBack: () => void;
  onFulfillment: (status: FulfillmentStatus) => void;
}) {
  const canEdit = order.status === "paid";

  return (
    <div className={pending ? "opacity-70" : undefined}>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 font-sans text-sm text-secondary underline-offset-2 hover:text-foreground hover:underline"
      >
        ← Volver a la lista
      </button>

      <h2 className="font-display text-xl font-bold text-foreground">
        {order.orderNumber}
      </h2>
      <p className="mt-1 font-sans text-sm text-secondary">
        {PAYMENT_LABELS[order.status]} · {formatMoney(order.subtotal)} ·{" "}
        {formatDate(order._createdAt)}
      </p>

      <section className="mt-5">
        <h3 className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          Cliente
        </h3>
        <p className="font-sans text-base text-foreground">
          {order.customer?.name || "—"}
        </p>
        {order.customer?.phone ? (
          <a
            href={`tel:${order.customer.phone}`}
            className="mt-1 block font-sans text-sm text-primary underline-offset-2 hover:underline"
          >
            {order.customer.phone}
          </a>
        ) : null}
        {order.customer?.email ? (
          <a
            href={`mailto:${order.customer.email}`}
            className="mt-1 block font-sans text-sm text-primary underline-offset-2 hover:underline"
          >
            {order.customer.email}
          </a>
        ) : null}
      </section>

      <section className="mt-5">
        <h3 className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          Envío
        </h3>
        <p className="font-sans text-sm leading-relaxed text-foreground">
          {[order.shipping?.address, order.shipping?.city, order.shipping?.province]
            .filter(Boolean)
            .join(", ") || "—"}
          {order.shipping?.postalCode ? ` (${order.shipping.postalCode})` : ""}
        </p>
        {order.shipping?.notes ? (
          <p className="mt-2 font-sans text-sm text-secondary">
            {order.shipping.notes}
          </p>
        ) : null}
      </section>

      <section className="mt-5">
        <h3 className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          Ítems
        </h3>
        <ul className="divide-y divide-outline-variant/40">
          {(order.items || []).map((item, index) => (
            <li
              key={`${item.productId ?? "item"}-${index}`}
              className="flex justify-between gap-3 py-2 font-sans text-sm"
            >
              <span className="text-foreground">
                {item.qty ?? 0}× {item.title || "Ítem"}
              </span>
              <span className="shrink-0 text-secondary">
                {formatMoney((item.unitPrice ?? 0) * (item.qty ?? 0))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h3 className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          Preparación / envío
        </h3>
        {!canEdit ? (
          <p className="font-sans text-sm text-secondary">
            Solo se puede actualizar cuando el pedido está pagado.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {FULFILLMENT_STATUSES.map((status) => {
              const active = order.fulfillmentStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={pending}
                  onClick={() => onFulfillment(status)}
                  className={`rounded px-3 py-3 text-left font-display text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-foreground hover:bg-surface-container-high"
                  }`}
                >
                  {FULFILLMENT_STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        )}
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
