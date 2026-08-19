---
name: sa-commerce
description: >-
  Santo Amore commerce domain: product purchase state, cart, checkout,
  MercadoPago preference/webhook, and order creation. Use when changing
  catalog buyability, carrito, /checkout, validate-cart, create-order,
  MercadoPago client/webhook, or saleSnapshot on paid online orders.
---

# Santo Amore — Commerce

## Invariants

- Sanity = catálogo editorial + señales de compra. **No** es carrito ni inventario transaccional.
- Carrito: cliente (`localStorage` `sa_cart_v1`), `components/cart/cart-provider.tsx`.
- Precios/stock se **revalidan en servidor** en `POST /api/checkout` vía `lib/checkout/validate-cart.ts`.
- `product.available` está deprecado; usar `commerceStatus` + `trackInventory`/`stockQty`.
- Sin variantes: un producto = un SKU. Lógica de compra en `lib/commerce.ts`.
- Toda lógica nueva en `lib/` con Vitest `*.test.ts` en el mismo cambio.
- No inventar costo de envío ni checkout paralelo; MP Checkout Pro es el camino.

## Purchase state

`getEffectiveCommerceStatus` / `getProductPurchaseState` en `lib/commerce.ts`:

| Status | canPurchase |
| --- | --- |
| `available` (o stock > 0 si track) | sí |
| `made_to_order` | sí |
| `coming_soon` / `sold_out` / stock 0 con track | no |

## Flujo checkout (happy path)

1. UI `/checkout` → `POST /api/checkout` ([`app/api/checkout/route.ts`](../../../app/api/checkout/route.ts)).
2. Parse customer/shipping → `validateCheckoutCart` → `createPendingOrder` (`status: pending`, `fulfillmentStatus: to_prepare`).
3. `createCheckoutPreference` → `attachPreferenceToOrder`.
4. Redirect `initPoint` → retornos `/pedido/exito|pendiente|fallo`.
5. Webhook [`app/api/mercadopago/webhook/route.ts`](../../../app/api/mercadopago/webhook/route.ts): actualiza `order.status` (`paid`/`rejected`/…) y crea `saleSnapshot` idempotente si aprobó (`channel: online`).

## Archivos clave

| Área | Path |
| --- | --- |
| Buyability | `lib/commerce.ts` |
| Cart UI/state | `components/cart/`, `lib/cart/` |
| Validate + types | `lib/checkout/` |
| Create order/preference | `lib/checkout/create-order.ts` |
| MP client/status/signature | `lib/mercadopago/` |
| Webhook | `app/api/mercadopago/webhook/route.ts` |
| Online snapshot | `lib/ops/sale-snapshot.ts` |
| Site gate | `proxy.ts` (`/api/mercadopago` excluido) |
| Product schema | `sanity/schemaTypes/product.ts` |

## Al cambiar commerce

1. Leer este skill + playbook [docs/agents/playbook-pedido-end-to-end.md](../../../docs/agents/playbook-pedido-end-to-end.md).
2. Extraer parsers/guards a `lib/`; no dejar lógica de negocio solo en routes.
3. Tests: `npm test` (CI corre lint + test).
4. No commitear keys MP/Sanity; usar `.env.local`.
5. Stock online: hoy **no** se descuenta al pagar (manual/ops); no asumir descuento automático en webhook.

## Playbook pedido

Detalle punta a punta (ops + Chatwoot): [docs/agents/playbook-pedido-end-to-end.md](../../../docs/agents/playbook-pedido-end-to-end.md).
