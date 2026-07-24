"use client";

import { useEffect } from "react";

/** Registra el SW de /ops (necesario para “Instalar app” en Android/Chrome). */
export function OpsServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Solo en páginas ops; el SW ya tiene scope /ops/
    void navigator.serviceWorker.register("/ops/sw.js", { scope: "/ops/" }).catch((err) => {
      console.warn("[ops] No se pudo registrar el service worker", err);
    });
  }, []);

  return null;
}
