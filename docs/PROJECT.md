# Santo Amore — Contexto del proyecto

Documento vivo para que cualquier chat/agente retome el hilo sin perder decisiones.

Última actualización: 2026-07-24 (métricas /ops + saleSnapshot)

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
- Shell: header fijo blur + ícono carrito (drawer) + footer links
- Assets mock: `public/brand/neo-*.png|jpg`
- Tipografía: Montserrat + Inter
- `/en-construccion` mantiene la landing Artisanal previa

## Decisiones de producto

- Priorizar **costo bajo**: Next + CMS headless + Vercel free tier antes que Shopify
- Compra online **después** del catálogo y contenido
- Arrancar UI con **mocks** alineados al schema Sanity; flip de flag al cablear CMS
- Instagram opcional vía `NEXT_PUBLIC_INSTAGRAM_URL`

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
- Env: `.env.example` → Sanity + `SANITY_API_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `OPS_PASSWORD`
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

## Próximos pasos sugeridos

1. Configurar tokens en `.env.local` / Vercel (`MERCADOPAGO_*`, `SANITY_API_WRITE_TOKEN`, `OPS_PASSWORD`, `NEXT_PUBLIC_SITE_URL` HTTPS en deploy)
2. Probar checkout en sandbox MP + webhook (URL pública; localhost no recibe notificaciones)
3. Cargar contenido real en Sanity y `USE_SANITY_MOCKS=false`
4. Pulir home/catálogo vs Stitch; opcional: costo de envío / email de confirmación
5. (Ops) descontar `stockQty` automático al marcar pedido `paid`
6. Cargar `unitCost` en productos y correr `npm run backfill:sale-snapshots` si ya hay ventas pagadas

## Staging password (sin plan Vercel pago)

- Variable `SITE_PASSWORD` solo en el entorno Staging/Preview (nunca en Production)
- Si está seteada y `VERCEL_ENV !== production`, el `proxy.ts` redirige a `/acceso`
- Cookie httpOnly `sa_site_gate` tras login correcto
- Producción queda abierta (el gate se desactiva aunque exista la var por error)
  ...
