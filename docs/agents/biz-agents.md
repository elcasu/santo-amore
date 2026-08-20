# Agentes de negocio (Fase 3)

Condición de entrada: ventas reales, `/ops` en uso diario, Chatwoot vivo. Hasta entonces, usar skills + playbooks a mano.

**Regla dura:** humano aprueba todo lo que toque plata, stock o mensaje al cliente. Los agentes proponen; el staff ejecuta.

## Orden de construcción

```mermaid
flowchart LR
  metrics[ReporterMetricas]
  ops[AsistenteOps]
  drafts[DraftsChatwoot]
  metrics --> ops --> drafts
```

---

## 1. Reporter de métricas

### Objetivo

Resumir la semana (o preset) sin abrir un dashboard largo.

### Datos

- `GET /api/ops/metrics?preset=7d|30d|90d` (requiere sesión ops o ejecutar lógica vía `lib/ops/metrics.ts` en scripts internos).
- Fuente: `saleSnapshot` only.

### Prompt plantilla

```text
Rol: reporter de métricas Santo Amore (skill sa-ops).
Pedime o usá el JSON de /api/ops/metrics preset=7d.
Devolvé en español, corto:
- Revenue, pedidos, ticket medio, margen bruto
- Top 3 productos por grossProfit
- Cola fulfillment (to_prepare / preparing / shipped)
- 1 alerta si algo huele mal (caída vs intuición, cola larga, margen raro)
No inventes números. No escribas en Sanity.
```

### Output esperado

Markdown de como máximo 15 líneas + “próxima acción humana sugerida”.

### No hacer

- No patchear precios ni costos.
- No “corregir” snapshots históricos.

---

## 2. Asistente de ops (fulfillment / stock)

### Objetivo

Sugerir próximo estado de pedido o alertar stock bajo; **no** escribir Sanity sin confirmación explícita.

### Prompt plantilla

```text
Rol: asistente ops Santo Amore (skill sa-ops + playbook pedido).
Contexto: lista de pedidos pagados / productos con trackInventory.
Para cada ítem urgente: sugerí acción (preparing|shipped|restock|revisar)
+ motivo en una línea.
NO llames APIs de escritura salvo que yo diga “aplicá”.
```

### Confirmación humana

```text
Aplicá solo: pedido <id> → shipped
```

Sin esa frase, solo plan.

### No hacer

- No marcar fulfillment de pedidos no `paid`.
- No descontar stock online “porque sí” (hoy es manual salvo offline sales).

---

## 3. Drafts de atención (Chatwoot)

### Objetivo

Borrador de respuesta con tono de marca; el staff pega/envía en Chatwoot.

### Prompt plantilla

```text
Rol: drafts de atención Santo Amore (tono cercano, cálido, breve).
Contexto del pedido: <orderNumber, ítems, fulfillmentStatus, ciudad>.
Mensaje del cliente: """<pegar>"""
Devolvé 2 borradores (corto / un poco más completo) en español rioplatense cuidado.
No prometas plazos de envío inventados ni descuentos.
No envíes nada: solo texto para Chatwoot.
```

### No hacer

- No integrar envío automático por WhatsApp Cloud API en MVP de agentes.
- No usar el número personal del staff.
- Fuera de ventana 24h: recordar que hace falta plantilla Meta (humano elige plantilla).

---

## 4. Después (bajo riesgo)

Solo cuando 1–3 funcionen semanalmente:

- Recordatorios internos de días especiales (ya hay cron push; el agente puede redactar copy del banner).
- Drafts de copy home/journal alineados a “Artisanal Soul, Modern Grace”.
- Checklist post-venta (¿pedido shipped + cliente avisado en Chatwoot?).

## Medición

Por cada rol, anotá 2 semanas:

| Métrica | Meta |
| --- | --- |
| Tiempo humano ahorrado | Mayor que el tiempo corrigiendo al agente |
| Errores que llegaron a cliente/stock | 0 por autonomía indebida |
| % drafts usados sin reescritura total | creciente |

Si no cumple: volver a skill/playbook, no sumar más agentes.
