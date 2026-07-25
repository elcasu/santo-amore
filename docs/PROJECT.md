# Santo Amore — Contexto del proyecto

Documento vivo para que cualquier chat/agente retome el hilo sin perder decisiones.

Última actualización: 2026-07-25 (WhatsApp Cloud API + Chatwoot)

## Qué es

Sitio web para **Santo Amore**: negocio de venta de accesorios, pulseras, collares y piezas para el hogar (Accessories / Home). Marca con eslogan **“Artisanal Soul, Modern Grace”**. Dirección visual actual: **Neo Luxury refined** (Stitch).

## Stack

| Capa           | Elección                               | Notas                                        |
| -------------- | -------------------------------------- | -------------------------------------------- |
| Frontend       | **Next.js 16** + React 19 + Tailwind 4 | Repo `santo-amore`                           |
| Fuentes        | Montserrat (display) + Inter (body)    | Stitch Neo Luxury refined                    |
| Hosting        | **Vercel**                             | Ya hay deploy en producción                  |
| CMS            | **Sanity** (plan Free)                 | Studio embebido en `/studio` (`next-sanity`) |
| Datos UI       | Mocks tipados → Sanity                 | Flag `NEXT_PUBLIC_USE_SANITY_MOCKS`          |
| Pagos           | **MercadoPago Checkout Pro**           | Preference + webhook + `order` en Sanity     |
| Diseño         | **Google Stitch**                      | Fuente de verdad visual                      |

### Repo / remoto

- GitHub: `git@github.com:elcasu/santo-amore.git`
- No commitear secretos (API keys van en `~/.cursor/mcp.json` o `.env*`, nunca al repo)

## Fases

1. Landing “Sitio en construcción” — conservada en `/en-construccion`
2. Catálogo + páginas + carrito (home, catálogo, detalle, drawer/`/carrito`)
3. Cablear Sanity real (`NEXT_PUBLIC_USE_SANITY_MOCKS=false`)
4. **Ahora — Checkout MercadoPago** (`/checkout`, webhook, pedidos)

## Stitch (diseños)

- App: [stitch.withgoogle.com](https://stitch.withgoogle.com/)
- Proyecto: **Santo Amore Brand & E-commerce**
- Resource / project id: `2065194152101387591`
- Dirección visual elegida: **Neo Luxury refined**
- Pantallas clave:
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

## Design tokens (Neo Luxury refined)

```text
background / surface:  #fbf9f8
surface-container:     #efeded
surface-container-high:#e9e8e7
primary:               #b71511
primary-container:     #db3327
primary-fixed-dim:     #ffb4a9
secondary:             #5f5e5e
on-surface:            #1b1c1c
outline-variant:       #e5beb8
```

### UI actual (store Neo Luxury)

- Rutas: `/` home, `/catalogo`, `/producto/[slug]`, `/carrito`, `/checkout`, `/pedido/exito|pendiente|fallo`, `/nosotros`, `/envios`, `/contacto`, `/ops` (staff)
- Shell: header fijo blur + ícono carrito (drawer) + footer links + FAB WhatsApp (si hay `NEXT_PUBLIC_WHATSAPP_PHONE`)
- Assets mock: `public/brand/neo-*.png|jpg`
- Tipografía: Montserrat + Inter
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
- Rutas: `/ops/login`, `/ops` (productos), `/ops/pedidos`, `/ops/metricas`
- APIs: `/api/ops/*` (login/logout, products, orders, metrics) — usan `SANITY_API_WRITE_TOKEN`
- Pedidos: `order.fulfillmentStatus` = `to_prepare` | `preparing` | `shipped` | `delivered` (aparte del `status` de pago)
  - Al pasar a `shipped`/`delivered`, se setea `shippedAt` / `deliveredAt` (setIfMissing)
- **Inbox:** link externo a Chatwoot (`NEXT_PUBLIC_OPS_INBOX_URL`) en la nav; en detalle de pedido → “Contactar en inbox” + copiar teléfono (buscar en Chatwoot). **No** abrir `wa.me` al cliente desde el celular personal del staff
- No descuenta stock automático al pagar (manual en `/ops` por ahora)
- **PWA instalable:** manifest + SW en `/ops` (`public/ops/manifest.webmanifest`, `public/ops/sw.js`)
  - Android/Chrome: banner “Instalar” o menú → Instalar app
  - iPhone/Safari: Compartir → Agregar a pantalla de inicio
  - Abrir siempre desde el ícono (abre en modo standalone, sin barra del browser)

### Métricas de negocio (sin data warehouse)

**Regla:** las estadísticas leen solo `saleSnapshot`, no el catálogo vivo ni campos editables del pedido. Cambiar precio/`unitCost` de un producto no reescribe el histórico.

- `product.unitCost` (ARS, opcional): costo actual; se snappea al checkout en `order.items[].unitCost`
- Al webhook MP con pago `approved`: crea `saleSnapshot` idempotente (`orderId` único) con revenue / cogs / grossProfit congelados
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
  - Webhook: `POST /api/mercadopago/webhook` (excluido del site gate); actualiza `order` a `paid`/`rejected` y crea `saleSnapshot` si aprobó
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

## Próximos pasos sugeridos

1. Configurar tokens en `.env.local` / Vercel (`MERCADOPAGO_*`, `SANITY_API_WRITE_TOKEN`, `OPS_PASSWORD`, `NEXT_PUBLIC_SITE_URL` HTTPS en deploy)
2. Completar alta WhatsApp (checklist arriba) y setear `NEXT_PUBLIC_WHATSAPP_PHONE` + `NEXT_PUBLIC_OPS_INBOX_URL`
3. Probar checkout en sandbox MP + webhook (URL pública; localhost no recibe notificaciones)
4. Cargar contenido real en Sanity y `USE_SANITY_MOCKS=false`
5. Pulir home/catálogo vs Stitch; opcional: costo de envío / email de confirmación
6. (Ops) descontar `stockQty` automático al marcar pedido `paid`
7. Cargar `unitCost` en productos y correr `npm run backfill:sale-snapshots` si ya hay ventas pagadas

## Staging password (sin plan Vercel pago)

- Variable `SITE_PASSWORD` solo en el entorno Staging/Preview (nunca en Production)
- Si está seteada y `VERCEL_ENV !== production`, el `proxy.ts` redirige a `/acceso`
- Cookie httpOnly `sa_site_gate` tras login correcto
- Producción queda abierta (el gate se desactiva aunque exista la var por error)
  ...
