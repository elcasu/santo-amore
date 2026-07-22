# Santo Amore — Contexto del proyecto

Documento vivo para que cualquier chat/agente retome el hilo sin perder decisiones.

Última actualización: 2026-07-22

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
| Pagos (fase 3) | MercadoPago Checkout Pro               | Más adelante                                 |
| Diseño         | **Google Stitch**                      | Fuente de verdad visual                      |

### Repo / remoto

- GitHub: `git@github.com:elcasu/santo-amore.git`
- No commitear secretos (API keys van en `~/.cursor/mcp.json` o `.env*`, nunca al repo)

## Fases

1. Landing “Sitio en construcción” — conservada en `/en-construccion`
2. **Ahora — Catálogo + páginas con mocks Neo Luxury** (home, catálogo, detalle, CMS pages)
3. Cablear Sanity real (`NEXT_PUBLIC_USE_SANITY_MOCKS=false`)
4. **E-commerce** (carrito, MercadoPago, pedidos)

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

- Rutas: `/` home, `/catalogo`, `/producto/[slug]`, `/nosotros`, `/envios`, `/contacto`
- Shell: header fijo blur + footer links
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
- Schema: `category`, `product`, `page`
- Env: `.env.example` → `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_USE_SANITY_MOCKS`
- Dataset: `production`

## Próximos pasos sugeridos

1. Cargar contenido real en Sanity Studio (categorías, productos, páginas)
2. `NEXT_PUBLIC_USE_SANITY_MOCKS=false` + CORS Vercel
3. Pulir home/catálogo vs pantallas Stitch
4. Fase MercadoPago

## Staging password (sin plan Vercel pago)

- Variable `SITE_PASSWORD` solo en el entorno Staging/Preview (nunca en Production)
- Si está seteada y `VERCEL_ENV !== production`, el `proxy.ts` redirige a `/acceso`
- Cookie httpOnly `sa_site_gate` tras login correcto
- Producción queda abierta (el gate se desactiva aunque exista la var por error)
  ...
