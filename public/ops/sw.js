/* Santo Amore Ops — service worker mínimo para installability (Android/Chrome).
 * Scope: /ops/ (el archivo vive en /ops/sw.js).
 */
const CACHE = "sa-ops-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        "/ops",
        "/ops/login",
        "/ops/pedidos",
        "/ops/manifest.webmanifest",
        "/ops/icons/icon-192.png",
        "/ops/icons/icon-512.png",
      ]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!url.pathname.startsWith("/ops")) return;

  // Nunca cachear APIs ni mutaciones — solo shell estático / navegación.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok && url.pathname.match(/\.(png|webmanifest)$/)) {
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return (
            (await caches.match("/ops")) ||
            (await caches.match("/ops/login")) ||
            Response.error()
          );
        }
        return Response.error();
      }),
  );
});
