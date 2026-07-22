# Santo Amore — Contexto del proyecto

Documento vivo para que cualquier chat/agente retome el hilo sin perder decisiones.

Última actualización: 2026-07-22

## Qué es

Sitio web para **Santo Amore**: negocio de venta de accesorios, pulseras, collares y piezas para el hogar (Accessories / Home). Marca con estética **Artisanal** (“Artisanal Soul, Modern Grace”).

## Stack

| Capa | Elección | Notas |
|------|----------|--------|
| Frontend | **Next.js 16** + React 19 + Tailwind 4 | Repo `santo-amore` |
| Fuentes | Montserrat (display) + Inter (body) | Según pantallas Stitch Artisanal |
| Hosting | **Vercel** | Ya hay deploy en producción |
| CMS (plan) | **Sanity** (preferido) o Payload | Pendiente de implementar |
| Pagos (fase 3) | MercadoPago Checkout Pro | Más adelante |
| Diseño | **Google Stitch** | Fuente de verdad visual |

### Repo / remoto

- GitHub: `git@github.com:elcasu/santo-amore.git`
- No commitear secretos (API keys van en `~/.cursor/mcp.json` o `.env*`, nunca al repo)

## Fases

1. **Ahora — Landing “Sitio en construcción”** (en curso / casi lista para iterar)
2. **Catálogo + páginas informativas** (CMS, productos, Nosotros, Envíos, Contacto)
3. **E-commerce** (carrito, MercadoPago, pedidos)

## Stitch (diseños)

- App: [stitch.withgoogle.com](https://stitch.withgoogle.com/)
- Proyecto: **Santo Amore Brand & E-commerce**
- Resource: `projects/2065194152101387591`
- Dirección visual elegida: **Artisanal**
- Pantalla de construcción de referencia: **Sitio en Construcción (Ilustración Seleccionada)**  
  `projects/2065194152101387591/screens/7d1a93e6f2584951a07df4e022ba09a4`
- Logo de marca: **Santo Amore Logo (Original Match)**  
  `projects/2065194152101387591/screens/c87d5a14d84b41eca3f47b7f98988fb8`
- MCP Stitch en Cursor: endpoint remoto + API key en `~/.cursor/mcp.json` (no en el repo)

Otras pantallas Artisanal útiles (más adelante): Catálogo, Brazalete Aurelia, Checkout Artisanal.

## Design tokens (Stitch Artisanal)

```text
background / surface:  #fff8f5
surface-container:     #f5ece7
primary:               #7e000e
primary-container:     #a11d21
secondary:             #735c00
on-surface:            #1e1b18
outline-variant:       #e1bebb
```

### UI actual (página en construcción)

- Header: fondo claro de marca (`#fff8f5` / `--surface` preferido), sombra inferior suave
- Body: blanco o canvas claro según iteración; ilustración artesana con PNG transparente
- Footer: `--surface-container` (`#f5ece7`)
- Logo header: `/public/brand/logo-header.png` (RGBA transparente)
- Ilustración: `/public/brand/illustration-artisan-transparent.png`
- Tipografía: Montserrat + Inter
- Textos: “Sitio en Construcción” / “Estamos trabajando en ello”
- Mantener la composición **minimalista** (evitar sumar MMXXIV/ALMA/nav del footer salvo que se pida)

## Decisiones de producto

- Priorizar **costo bajo**: Next + CMS headless + Vercel free tier antes que Shopify
- TiendaNube / WordPress solo si el negocio necesita autonomía total sin desarrollo
- Compra online **después** del catálogo y contenido
- Instagram opcional vía `NEXT_PUBLIC_INSTAGRAM_URL`

## Convenciones técnicas

- Leer docs de Next en `node_modules/next/dist/docs/` (esta versión no es la “Next clásica”)
- Turbopack: `turbopack.root` anclado al proyecto (hay `package-lock.json` en `~` que confunde el root)
- Assets de marca en `public/brand/`
- Descargas temporales de Stitch en `.tmp-stitch/` (gitignored)
- Para logos/PNG: si Stitch exporta damero, limpiar a RGBA real o componer sobre el color del contenedor
- Caché de imágenes: renombrar asset o `unoptimized` + hard refresh si no se ve el cambio

## Próximos pasos sugeridos

1. Cerrar detalles visuales de la landing y deploy estable
2. Definir schema Sanity (productos, categorías, páginas)
3. Implementar catálogo Artisanal desde Stitch
4. Páginas informativas + contacto/WhatsApp
5. Fase MercadoPago
