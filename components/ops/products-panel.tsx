"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  COMMERCE_STATUSES,
  COMMERCE_STATUS_LABELS,
  type OpsProduct,
} from "@/lib/ops/types";
import type { CommerceStatus } from "@/lib/types/content";

export function ProductsPanel({
  initialProducts,
}: {
  initialProducts: OpsProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false),
    );
  }, [products, query]);

  const selected = selectedId
    ? (products.find((p) => p._id === selectedId) ?? null)
    : null;

  async function patchProduct(
    id: string,
    body: {
      commerceStatus?: CommerceStatus;
      stockQty?: number;
      trackInventory?: boolean;
    },
  ) {
    setError(null);
    const res = await fetch(`/api/ops/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { product?: OpsProduct; error?: string };
    if (!res.ok || !data.product) {
      throw new Error(data.error || "No se pudo actualizar");
    }
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? data.product! : p)),
    );
  }

  function updateStatus(status: CommerceStatus) {
    if (!selected) return;
    startTransition(async () => {
      try {
        await patchProduct(selected._id, { commerceStatus: status });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function updateStock(nextQty: number) {
    if (!selected) return;
    const stockQty = Math.max(0, Math.floor(nextQty));
    startTransition(async () => {
      try {
        await patchProduct(selected._id, { stockQty, trackInventory: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <label className="mb-4 block">
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU"
          className="w-full rounded border border-outline-variant bg-white px-4 py-3 font-sans text-base text-foreground outline-none ring-primary focus:ring-2"
        />
      </label>

      {error ? (
        <p
          className="mb-3 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {selected ? (
        <ProductEditor
          product={selected}
          pending={pending}
          onBack={() => setSelectedId(null)}
          onStatus={updateStatus}
          onStock={updateStock}
        />
      ) : (
        <ul className="divide-y divide-outline-variant/50">
          {filtered.map((product) => (
            <li key={product._id}>
              <button
                type="button"
                onClick={() => setSelectedId(product._id)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-surface-container/60"
              >
                <Thumb product={product} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-semibold text-foreground">
                    {product.title}
                  </p>
                  <p className="mt-0.5 font-sans text-sm text-secondary">
                    {COMMERCE_STATUS_LABELS[product.commerceStatus]}
                    {product.trackInventory
                      ? ` · ${product.stockQty ?? 0} u.`
                      : ""}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="py-8 text-center font-sans text-sm text-secondary">
              No hay productos que coincidan.
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function ProductEditor({
  product,
  pending,
  onBack,
  onStatus,
  onStock,
}: {
  product: OpsProduct;
  pending: boolean;
  onBack: () => void;
  onStatus: (status: CommerceStatus) => void;
  onStock: (qty: number) => void;
}) {
  const qty = product.stockQty ?? 0;

  return (
    <div className={pending ? "opacity-70" : undefined}>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 font-sans text-sm text-secondary underline-offset-2 hover:text-foreground hover:underline"
      >
        ← Volver a la lista
      </button>

      <div className="mb-5 flex items-start gap-3">
        <Thumb product={product} large />
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-foreground">
            {product.title}
          </h2>
          {product.sku ? (
            <p className="mt-1 font-sans text-sm text-secondary">
              SKU {product.sku}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
        Estado
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {COMMERCE_STATUSES.map((status) => {
          const active = product.commerceStatus === status;
          return (
            <button
              key={status}
              type="button"
              disabled={pending}
              onClick={() => onStatus(status)}
              className={`rounded px-3 py-3 text-left font-display text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-foreground hover:bg-surface-container-high"
              }`}
            >
              {COMMERCE_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      <p className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
        Stock
      </p>
      <StockStepper qty={qty} pending={pending} onStock={onStock} />
      <p className="mt-2 font-sans text-xs text-secondary">
        Al editar stock se activa el control numérico del producto.
      </p>
    </div>
  );
}

function StockStepper({
  qty,
  pending,
  onStock,
}: {
  qty: number;
  pending: boolean;
  onStock: (qty: number) => void;
}) {
  const [draft, setDraft] = useState(String(qty));

  useEffect(() => {
    setDraft(String(qty));
  }, [qty]);

  function commitDraft() {
    const n = Number(draft);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      setDraft(String(qty));
      return;
    }
    if (n !== qty) onStock(n);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending || qty <= 0}
        onClick={() => onStock(qty - 1)}
        className="h-12 w-12 rounded bg-surface-container font-display text-xl font-bold text-foreground disabled:opacity-40"
        aria-label="Restar unidad"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        step={1}
        value={draft}
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="h-12 w-24 rounded border border-outline-variant bg-white text-center font-display text-xl font-bold outline-none ring-primary focus:ring-2"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => onStock(qty + 1)}
        className="h-12 w-12 rounded bg-surface-container font-display text-xl font-bold text-foreground disabled:opacity-40"
        aria-label="Sumar unidad"
      >
        +
      </button>
      <button
        type="button"
        disabled={pending || qty === 0}
        onClick={() => onStock(0)}
        className="ml-auto rounded px-3 py-2 font-sans text-sm text-primary underline-offset-2 hover:underline disabled:opacity-40"
      >
        Poner en 0
      </button>
    </div>
  );
}

function Thumb({
  product,
  large,
}: {
  product: OpsProduct;
  large?: boolean;
}) {
  const size = large ? 72 : 56;
  const src = product.mainImage?.src;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded bg-surface-container"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={product.mainImage?.alt || product.title}
          fill
          className="object-cover"
          sizes={`${size}px`}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-sans text-xs text-secondary">
          —
        </div>
      )}
    </div>
  );
}
