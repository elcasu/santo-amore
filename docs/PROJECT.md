# Santo Amore — Contexto del proyecto

Documento vivo para que cualquier chat/agente retome el hilo sin perder decisiones.

Última actualización: 2026-08-20 (storefront atelier: paleta cálida + dos caminos de compra)

## Qué es

Sitio web para **Santo Amore**: negocio de venta de accesorios, pulseras, collares y piezas para el hogar (Accessories / Home). Marca con eslogan **“Artisanal Soul, Modern Grace”**. Dirección visual actual: **atelier cercano** (no el template Neo Luxury de Stitch).

## Stack

| Capa           | Elección                               | Notas                                        |
| -------------- | -------------------------------------- | -------------------------------------------- |
| Frontend       | **Next.js 16** + React 19 + Tailwind 4 | Repo `santo-amore`                           |
| Fuentes        | Fraunces (display) + Inter (body)      | Atelier cercano                              |
| Hosting        | **Vercel**                             | Ya hay deploy en producción                  |
| CMS            | **Sanity** (plan Free)                 | Studio embebido en `/studio` (`next-sanity`) |
| Datos UI       | Mocks tipados → Sanity                 | Flag `NEXT_PUBLIC_USE_SANITY_MOCKS`          |
| Pagos           | **MercadoPago Checkout Pro**           | Preference + webhook + `order` en Sanity     |
| Diseño         | Storefront propio (atelier)            | Stitch queda como archivo histórico          |

### Repo / remoto

- GitHub: `git@github.com:elcasu/santo-amore.git`
- No commitear secretos (API keys van en `~/.cursor/mcp.json` o `.env*`, nunca al repo)

## Fases

1. Landing “Sitio en construcción” — conservada en `/en-construccion`
2. Catálogo + páginas + carrito (home, catálogo, detalle, drawer/`/carrito`)
3. Cablear Sanity real (`NEXT_PUBLIC_USE_SANITY_MOCKS=false`)
4. **Ahora — Checkout MercadoPago** (`/checkout`, webhook, pedidos)

## Stitch (archivo)

Pantallas originales en Google Stitch; **ya no son la fuente de verdad visual** del storefront.

- App: [stitch.withgoogle.com](https://stitch.withgoogle.com/)
- Proyecto: **Santo Amore Brand & E-commerce**
- Resource / project id: `2065194152101387591`
- Dirección histórica: **Neo Luxury refined** (reemplazada en 2026-08-20 por atelier cercano)
- Pantallas clave (archivo):
  - Catálogo Neo-Luxury Refinado: `…/screens/ad58cf0deb8544509eb8d41294d6ac59`
  - Detalle Neo-Luxury: `…/screens/480f043ffa964d158cdbff6fe7b1dd22`
  - Catálogo Neo-Luxury (sección dinámica): `…/screens/72848a46a0304d96ab8b3ca6989606e3`
- Landing Artisanal histórica: **Sitio en Construcción (Ilustración Seleccionada)**  
  `…/screens/7d1a93e6f2584951a07df4e022ba09a4`
- Logo: **Santo Amore Logo (Original Match)**  
  `…/screens/c87d5a14d84b41eca3f47b7f98988fb8`

### Stitch MCP en Cursor (workaround HTTP)

A veces Settings → MCP muestra `stitch` en verde pero el **agent no recibe** las tools. La API key sí responde.

1. Preferir tools MCP nativas si aparecen en el catálogo del agent.
2. Si no: HTTP JSON-RPC a `https://stitch.googleapis.com/mcp` con header `X-Goog-Api-Key` leído de `~/.cursor/mcp.json` (nunca al repo).
3. Exports temporales en `.tmp-stitch/` (gitignored).

## Design tokens (atelier cercano)

```text
background / surface:  #fff8f5
surface-container:     #f5ece7
surface-container-high:#efe4dc
primary:               #7e000e
primary-container:     #a01220
primary-fixed-dim:     #c9898a
secondary:             #735c00
on-surface:            #1e1b18
outline-variant:       #e5d0c8
```

### UI actual (store atelier)

- Rutas: `/` home, `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/pedido/exito|pendiente|fallo`, `/nosotros`, `/envios`, `/contacto`, `/ops` (staff: productos, pedidos, ventas offline, métricas)
- Home: bienvenida (pieza contenida) → dos caminos (listo / encargo) → piezas → oficio/presencia en Mar del Plata → vitrina
- Catálogo: filtros de categoría + disponibilidad (`?disponibilidad=listas|encargo|proximamente`)
- Shell: header fijo blur + Piezas/Encargos/Nosotros/Contacto + ícono carrito (drawer) + footer “Atelier en {location}” + FAB WhatsApp (si hay `NEXT_PUBLIC_WHATSAPP_PHONE`)
- Assets mock: `public/brand/neo-*.png|jpg` (fotos reusadas; layout ya no las trata como campaña)
- Tipografía: Fraunces + Inter
- `/en-construccion` mantiene la landing Artisanal previa

## Decisiones de producto

- Priorizar **costo bajo**: Next + CMS headless + Vercel free tier antes que Shopify
- Compra online **después** del catálogo y contenido
- Arrancar UI con **mocks** alineados al schema Sanity; flip de flag al cablear CMS
- Instagram opcional vía `NEXT_PUBLIC_INSTAGRAM_URL`
- **WhatsApp:** Meta Cloud API + **Chatwoot** como inbox compartido (no grupo con el cliente; no número personal). Dos locales = varios agentes en la misma bandeja.

## Convenciones técnicas

- Leer docs de Next en `node_modules/next/dist/docs/`
- Turbopack: `turbopack.root` anclado al proyecto
- Capa de datos: `lib/data/` + tipos en `lib/types/content.ts`
- Assets de marca en `public/brand/`
- Descargas temporales de Stitch en `.tmp-stitch/` (gitignored)
- **Tests:** Vitest (unitarios de lógica en `lib/`, archivos `*.test.ts` junto al módulo). `npm test` / `npm run test:watch`. CI en GitHub Actions corre `lint` + `test` en push/PR a `main`.
- **Regla:** toda funcionalidad nueva o cambio de lógica de negocio incluye tests en el mismo cambio; si hace falta, extraer helpers a `lib/` para poder testearlos.

## Sanity (CMS)

- Studio: `/studio`
- Schema documentos: `home` (singleton), `category`, `product`, `page`, `order`, `saleSnapshot` (oculto en Studio; append-only)
- Schema objetos home: `heroSection`, `collectionsSection` (+ `collectionDrop` → **referencia a `product`** + label/span), `journalTeaser`, `featuredProductsSection`, `ctaLink`
- Env: `.env.example` → Sanity + `SANITY_API_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `MERCADOPAGO_*`, `OPS_PASSWORD`, `NEXT_PUBLIC_WHATSAPP_*`, `NEXT_PUBLIC_OPS_INBOX_URL`
- Dataset: `production`
- Con mocks (`USE_SANITY_MOCKS=true`): `lib/data/mocks.ts` → `mockHome`
- Con Sanity real: editar **Home** en Studio (`documentId: home`), luego `NEXT_PUBLIC_USE_SANITY_MOCKS=false`

### Ops móvil (`/ops`)

Mini app para el staff (sin Studio): stock, `commerceStatus`, fulfillment de pedidos y métricas de negocio.

- Auth: `OPS_PASSWORD` + cookie httpOnly `sa_ops_gate` (independiente de `SITE_PASSWORD`)
- Rutas: `/ops/login`, `/ops` (productos), `/ops/pedidos`, `/ops/ventas`, `/ops/metricas`
- APIs: `/api/ops/*` (login/logout, products, orders, offline-sales, metrics, special-days, push, cron) — usan `SANITY_API_WRITE_TOKEN`
- Pedidos: `order.fulfillmentStatus` = `to_prepare` | `preparing` | `shipped` | `delivered` (aparte del `status` de pago)
  - Al pasar a `shipped`/`delivered`, se setea `shippedAt` / `deliveredAt` (setIfMissing)
- **Ventas offline:** `/ops/ventas` — registrar ventas fuera del ecommerce (feria / local / WhatsApp / otro)
  - Crea `saleSnapshot` con `channel` offline + `notes` opcional; `orderId` sintético `offline:{uuid}`, número `OFF-YYMMDD-XXXX`
  - No crea documento `order` (no mezcla con la cola de fulfillment)
  - Descuenta `stockQty` si `trackInventory` y no es `made_to_order`; si llega a 0 → `commerceStatus: sold_out`
  - Entra a métricas junto con las ventas online (mismo `saleSnapshot`)
  - API: `GET/POST /api/ops/offline-sales`
- **Días especiales:** singleton Sanity `opsSpecialDays` (Studio → “Días especiales”)
  - Lista AR (Madre, Navidad, San Valentín, Amigo, Mujer, Niño, Padre, Reyes, Abuelos, Hermanos, Primos…)
  - Anticipación configurable (`defaultLeadDays`, default 7; override por ítem)
  - Reenvío push (`pushRepeatDays`, default 2; override por ítem): 1ª push al entrar en la ventana, luego cada N días + el día del evento
  - Fechas fijas (mes+día) o móviles (N-ésimo día de la semana del mes)
  - Banner in-app en `/ops` vía `GET /api/ops/special-days` cuando hoy entra en la ventana; dismiss por sesión
  - **Web Push:** opt-in en `/ops` (`OpsPushPrompt`); suscripciones en `opsPushSubscription`; recibos idempotentes `opsPushReceipt`
  - Cron Vercel diario `0 14 * * *` UTC (~11:00 AR) → `GET /api/ops/cron/special-days-push` con `Authorization: Bearer $CRON_SECRET`
  - Env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (`npx web-push generate-vapid-keys`)
  - iOS: solo con la PWA agregada a inicio (Safari 16.4+)
- **Inbox:** link externo a Chatwoot (`NEXT_PUBLIC_OPS_INBOX_URL`) en la nav; en detalle de pedido → “Contactar en inbox” + copiar teléfono (buscar en Chatwoot). **No** abrir `wa.me` al cliente desde el celular personal del staff
- Stock online: se descuenta al webhook `paid` si `trackInventory` (idempotente `stockAppliedAt`). `made_to_order` no descuenta. Ajuste manual sigue en `/ops` productos.
- **PWA instalable:** manifest + SW en `/ops` (`public/ops/manifest.webmanifest`, `public/ops/sw.js`)
  - Android/Chrome: banner “Instalar” o menú → Instalar app
  - iPhone/Safari: Compartir → Agregar a pantalla de inicio
  - Abrir siempre desde el ícono (abre en modo standalone, sin barra del browser)

### Métricas de negocio (sin data warehouse)

**Regla:** las estadísticas leen solo `saleSnapshot`, no el catálogo vivo ni campos editables del pedido. Cambiar precio/`unitCost` de un producto no reescribe el histórico.

- `product.unitCost` (ARS, opcional): costo actual; se snappea al checkout en `order.items[].unitCost`
- Al webhook MP con pago `approved`: crea `saleSnapshot` idempotente (`orderId` único) con `channel: "online"` y revenue / cogs / grossProfit congelados
- Ventas offline (`/ops/ventas`): mismo `saleSnapshot` con `channel` = `feria` | `local` | `whatsapp` | `other`
- Dashboard: `/ops/metricas` → `GET /api/ops/metrics?preset=7d|30d|90d` o `from`/`to`
- KPIs: revenue, pedidos, ticket medio, margen, ranking por producto (ROI = grossProfit/cogs), cola de fulfillment
- Studio: `saleSnapshot` oculto; campos financieros de `order` read-only
- Backfill de ventas ya pagadas: `npm run backfill:sale-snapshots` (requiere `tsx` + `.env.local`)
- Sin warehouse por ahora; si aparecen ads/contabilidad/volumen alto, evaluar export a BigQuery/MotherDuck

### Producto / disponibilidad / carrito

**Sanity = catálogo editorial + señales de compra.** No es inventario transaccional ni sesión de carrito.

- `product.commerceStatus`: `available` | `coming_soon` | `sold_out` | `made_to_order`
- Inventario mixto: `trackInventory` + `stockQty` (opcional); sin track solo importa el status
- Campos auxiliares: `sku`, `unitCost`, `compareAtPrice`, `comingSoonLabel`, `leadTimeDays`, `maxPerOrder`
- Sin variantes por ahora (un producto = un SKU); extensión futura vía `variantId` en el carrito
- Reglas UI en `lib/commerce.ts` (`getProductPurchaseState`)
- **Carrito:** vive en el cliente (`productId` + `qty` + snapshot), `localStorage` clave `sa_cart_v1`; no en Sanity
  - Provider: `components/cart/cart-provider.tsx` (`useSyncExternalStore`)
  - UI: drawer desde header + página `/carrito`
  - Add: ficha de producto (`AddToCart`); respeta `maxPerOrder` / stock
- **Checkout:** `/checkout` → `POST /api/checkout` valida carrito (precios/stock server-side) → crea `order` (`pending`) en Sanity → preference MercadoPago → redirect `init_point`
  - Retornos: `/pedido/exito` (limpia carrito), `/pedido/pendiente`, `/pedido/fallo`
  - Webhook: `POST /api/mercadopago/webhook` (excluido del site gate); actualiza `order` a `paid`/`rejected`, crea `saleSnapshot` si aprobó y descuenta stock tracked (`stockAppliedAt`)
  - Envío: datos capturados; costo a coordinar (sin cálculo en MVP)
- **Pedidos:** documento `order` en Studio (snapshot de ítems + customer/shipping + ids MP + `fulfillmentStatus`); campos financieros read-only
- **Analítica:** `saleSnapshot` append-only; métricas en `/ops/metricas`

### WhatsApp (Cloud API + Chatwoot)

Canal de atención 1:1 de la marca. El sitio solo enlaza; el staff atiende en Chatwoot.

**Stack**

- Número **dedicado** de la marca (línea/SIM; no hace falta un teléfono nuevo de uso diario).
- Meta WhatsApp **Cloud API** + inbox **Chatwoot** (Cloud para arrancar; self-host si el free se queda corto).
- Envs públicas: `NEXT_PUBLIC_WHATSAPP_PHONE`, `NEXT_PUBLIC_WHATSAPP_PREFILL` (opcional), `NEXT_PUBLIC_OPS_INBOX_URL`.
- UI store: FAB + CTA en `/contacto` vía `lib/whatsapp.ts` / `components/whatsapp-*.tsx` (si no hay phone, no se muestran).

**Checklist de alta (una vez)**

1. Línea dedicada (móvil real que Meta verifique por SMS/voz; evitar VoIP). Chip activo; celular barato de respaldo alcanza.
2. Meta Business Portfolio → WhatsApp Business Account → app Developers → Cloud API.
3. Chatwoot → canal WhatsApp Cloud API (phone number id, token, verify token, webhook).
4. Crear 2+ agentes (uno por local/turno); misma bandeja.
5. Perfil de negocio (nombre, horarios, foto).
6. Probar: mensaje → Chatwoot → responder desde dos dispositivos.

**Runbook corto**

- Responder **solo** desde Chatwoot, nunca desde WhatsApp personal.
- Mensajes iniciados por el negocio fuera de la ventana de 24h requieren **plantilla** aprobada en Meta.
- Alta de agente: invitar en Chatwoot (mismo inbox); no compartir la SIM del número de marca.
- Mejoras futuras (no MVP): API Chatwoot “abrir conversación del pedido”, widget web, template “pedido despachado”.

## Agentes (laboratorio)

Roadmap y vocabulario (rule / skill / subagente / automation / SDK): [`docs/agents/README.md`](agents/README.md).

- Skills de dominio: `.cursor/skills/sa-commerce`, `.cursor/skills/sa-ops`
- Playbook pedido: [`docs/agents/playbook-pedido-end-to-end.md`](agents/playbook-pedido-end-to-end.md)
- Práctica subagentes: [`docs/agents/practice-subagents.md`](agents/practice-subagents.md)
- Fase 2 (eng): [`docs/agents/eng-automations.md`](agents/eng-automations.md)
- Fase 3 (negocio): [`docs/agents/biz-agents.md`](agents/biz-agents.md)

## Próximos pasos sugeridos

1. Configurar tokens en `.env.local` / Vercel (`MERCADOPAGO_*`, `SANITY_API_WRITE_TOKEN`, `OPS_PASSWORD`, `NEXT_PUBLIC_SITE_URL` HTTPS en deploy)
2. Completar alta WhatsApp (checklist arriba) y setear `NEXT_PUBLIC_WHATSAPP_PHONE` + `NEXT_PUBLIC_OPS_INBOX_URL`
3. Probar checkout en sandbox MP + webhook (URL pública; localhost no recibe notificaciones)
4. Cargar contenido real en Sanity y `USE_SANITY_MOCKS=false`
5. Opcional: costo de envío / email de confirmación
6. Confirmar `MERCADOPAGO_WEBHOOK_SECRET` en Vercel Production (sin eso el webhook responde 500)
7. Cargar `unitCost` en productos y correr `npm run backfill:sale-snapshots` si ya hay ventas pagadas

## Staging password (sin plan Vercel pago)

- Variable `SITE_PASSWORD` solo en el entorno Staging/Preview (nunca en Production)
- Si está seteada y `VERCEL_ENV !== production`, el `proxy.ts` redirige a `/acceso`
- Cookie httpOnly `sa_site_gate` tras login correcto
- Producción queda abierta (el gate se desactiva aunque exista la var por error)
  ...
