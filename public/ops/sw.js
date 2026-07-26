/* Santo Amore Ops — service worker (installability + Web Push).
 * Scope: /ops/ (el archivo vive en /ops/sw.js).
 */
const CACHE = "sa-ops-v2";

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

self.addEventListener("push", (event) => {
  let data = {
    title: "Santo Amore Ops",
    body: "Hay un aviso de día especial",
    url: "/ops",
    tag: "sa-ops-special-day",
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/ops/icons/icon-192.png",
      badge: "/ops/icons/icon-192.png",
      tag: data.tag || "sa-ops-special-day",
      renotify: true,
      data: { url: data.url || "/ops" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/ops";
  const absolute = new URL(target, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client && client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(absolute);
            } catch {
              /* ignore */
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(absolute);
      }
    })(),
  );
});
