# Práctica de subagentes (Fase 1)

Ejercicios para aprender Task/subagentes sobre este repo. No hace falta orquestador.

## Catálogo útil

| Subagente | Pedilo cuando… | Prompt mínimo |
| --- | --- | --- |
| `explore` | No sabés dónde está el flujo | “Mapeá X; listá archivos clave; no modifiques” |
| `ci-investigator` | CI de un PR falla | Repo + PR + nombre del check |
| `bugbot` | Querés review estilo Bugbot del diff | Solo si pedís explícitamente Bugbot |
| `security-review` | Cambios sensibles (auth, webhooks, tokens) | Solo si pedís explícitamente security review |

Regla: un subagente = un objetivo. No le pidas “arreglá todo el ecommerce”.

## Ejercicios sugeridos

### A — Explore checkout (hacer primero)

En el chat Agent:

> Usá un subagente explore (medium) para mapear checkout → webhook → saleSnapshot → fulfillment. Devolvé secuencia, invariantes y top 5 archivos para debug. Sin modificar archivos.

Éxito: el informe coincide con [playbook-pedido-end-to-end.md](./playbook-pedido-end-to-end.md).

### B — Explore ops offline

> Explore: cómo se crea una venta offline y cómo impacta stock y métricas. Archivos en `lib/ops/`.

### C — CI investigator (cuando haya PR roja)

> Investigá el check `quality` fallido del PR #N y resumí causa raíz en 5 líneas.

### D — Security review (cuando toques webhook/auth)

> Security review del diff de branch vs main, foco en webhook MP, ops auth y tokens.

## Bitácora

Registrá acá corridas reales (fecha + qué aprendiste).

### 2026-08-19 — Explore checkout (medium)

**Pedido:** mapear checkout → payment → order → ops. Sin modificar archivos.

**Hallazgos:**

- Carrito local → `POST /api/checkout` (validate + order `pending`/`to_prepare` + preference) → MP → webhook (fuente de verdad) → `paid` + `saleSnapshot` online idempotente.
- Fulfillment en `/ops/pedidos` solo si `paid`: `to_prepare` → `preparing` → `shipped` → `delivered`.
- Stock online **no** baja al pagar; offline sí. Métricas leen solo snapshots.
- Webhook no degrada un order ya `paid`; firma opcional si falta `MERCADOPAGO_WEBHOOK_SECRET`.
- Top debug unpaid: webhook → checkout route → `create-order.ts` → `map-payment-status.ts` → `lib/ops/orders.ts` / doc `order` en Sanity.

**Aprendizaje:** un explore medium refresca el mapa sin ensuciar el hilo; el playbook queda como fuente estable.

### 2026-08-19 — Explore ops offline (quick)

**Pedido:** create flow, channels, stock, métricas.

**Hallazgos:**

- Solo `saleSnapshot` (`offline:{uuid}`); channels `feria|local|whatsapp|other`; no `order`.
- Stock si `trackInventory`; fallo de stock no revierte el snapshot.
- Métricas suman todos los snapshots del rango; cola fulfillment ignora offline.

**Aprendizaje:** el contraste online/offline es el invariante más fácil de romper si un agente unifica mal los modelos.

## Cómo pedir bien

```text
Objetivo: …
Contexto: Santo Amore, ver docs/agents/playbook-pedido-end-to-end.md
Restricciones: no modificar archivos / no inventar envíos / devolver paths concretos
Formato de salida: lista + secuencia + invariantes
```
