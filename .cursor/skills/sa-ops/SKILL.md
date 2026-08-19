---
name: sa-ops
description: >-
  Santo Amore staff ops: /ops PWA, paid-order fulfillment
  (PATCH /api/ops/orders/[id]), offline sales (POST /api/ops/offline-sales,
  snapshot without order), metrics from saleSnapshot only, special-days push,
  and Chatwoot inbox. Use when working on /ops, app/api/ops/*, lib/ops/*,
  saleSnapshot, stockQty, or staff fulfillment.
---

# Santo Amore — Ops

## Invariants

- Auth ops: `OPS_PASSWORD` + cookie `sa_ops_gate` (independiente de `SITE_PASSWORD`).
- Métricas leen **solo** `saleSnapshot` (append-only). Cambiar precio/`unitCost` del producto no reescribe histórico.
- Pedidos online: documento `order` + fulfillment. Ventas offline: **solo** `saleSnapshot` (sin `order`).
- Fulfillment solo en pedidos `status === "paid"`.
- Responder clientes desde **Chatwoot**, no desde WhatsApp personal / `wa.me` del staff.
- Lógica en `lib/ops/` con Vitest; APIs en `app/api/ops/*` usan `SANITY_API_WRITE_TOKEN`.
- No inventar rutas ni archivos: si no está en **Rutas UI** o en este skill, no existe.

## Rutas UI

| Ruta | Uso |
| --- | --- |
| `/ops/login` | Gate |
| `/ops` | Productos / stock / `commerceStatus` |
| `/ops/pedidos` | Fulfillment |
| `/ops/ventas` | Ventas offline |
| `/ops/metricas` | KPIs |

Inbox: `NEXT_PUBLIC_OPS_INBOX_URL` (Chatwoot).

## Fulfillment

Estados: `to_prepare` → `preparing` → `shipped` → `delivered` (`lib/ops/orders.ts`).

- `shipped`/`delivered`: `setIfMissing` `shippedAt` / `deliveredAt`.
- Patch: `PATCH` vía `app/api/ops/orders/[id]`.

## Ventas offline

`lib/ops/offline-sales.ts` + `POST /api/ops/offline-sales`:

- Channels: `feria` | `local` | `whatsapp` | `other`.
- `orderId` sintético `offline:{uuid}`, número `OFF-YYMMDD-XXXX`.
- Descuenta `stockQty` si `trackInventory`; a 0 → `commerceStatus: sold_out`.
- Entra a métricas junto con online.

## Métricas

`lib/ops/metrics.ts` + `GET /api/ops/metrics?preset=7d|30d|90d` o `from`/`to`.

KPIs: revenue, pedidos, ticket medio, margen, ranking producto, cola fulfillment (pedidos pagados, no snapshots).

## Días especiales / push

Singleton `opsSpecialDays`, cron Vercel `GET /api/ops/cron/special-days-push`, VAPID en `/ops`. No mezclar con lógica de checkout.

## Al cambiar ops

1. No mutar `saleSnapshot` existentes; son append-only.
2. No crear `order` para offline.
3. No abrir envío autónomo de WhatsApp desde el código del sitio.
4. Tests en `lib/ops/*.test.ts`.
5. Playbook pedido: [docs/agents/playbook-pedido-end-to-end.md](../../../docs/agents/playbook-pedido-end-to-end.md).
6. Agentes de negocio (futuro): [docs/agents/biz-agents.md](../../../docs/agents/biz-agents.md).
