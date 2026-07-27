"use client";

import { useCallback, useEffect, useState } from "react";

type PromptState =
  | "loading"
  | "prompt"
  | "subscribed"
  | "unsupported"
  | "denied"
  | "unavailable"
  | "hidden";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem("sa_ops_push_dismissed") === "1";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem("sa_ops_push_dismissed", "1");
  } catch {
    /* ignore */
  }
}

function clearDismissed() {
  try {
    localStorage.removeItem("sa_ops_push_dismissed");
  } catch {
    /* ignore */
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(id);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(id);
        reject(error);
      },
    );
  });
}

async function ensureOpsServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/ops/");
  if (existing?.active) return existing;

  const reg = await withTimeout(
    navigator.serviceWorker.register("/ops/sw.js", { scope: "/ops/" }),
    8_000,
    "Timeout registrando el service worker",
  );

  // `.ready` puede colgarse si nunca hay SW activo; limitar espera.
  await withTimeout(
    navigator.serviceWorker.ready,
    8_000,
    "Timeout esperando service worker activo",
  );

  return reg;
}

/**
 * Opt-in a Web Push para avisos de días especiales (requiere SW + VAPID).
 * Muestra estado también cuando no está disponible (evita “desaparecer” en silencio).
 */
export function OpsPushPrompt() {
  const [state, setState] = useState<PromptState>("loading");
  const [detail, setDetail] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: { cancelled: boolean }) => {
    const alive = () => !signal?.cancelled;

    // Evita setState síncrono en el effect (regla react-hooks/set-state-in-effect).
    await Promise.resolve();
    if (!alive()) return;

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      if (!alive()) return;
      setState("unsupported");
      setDetail(
        "Este navegador no soporta Web Push. En iPhone: agregá Ops a inicio y abrila desde el ícono.",
      );
      return;
    }
    if (!window.isSecureContext) {
      if (!alive()) return;
      setState("unsupported");
      setDetail("Hace falta HTTPS.");
      return;
    }

    try {
      const vapidRes = await withTimeout(
        fetch("/api/ops/push/vapid"),
        10_000,
        "Timeout consultando VAPID",
      );
      if (!alive()) return;
      if (vapidRes.status === 401) {
        setState("unavailable");
        setDetail("Tenés que estar logueada en Ops.");
        return;
      }
      if (!vapidRes.ok) {
        setState("unavailable");
        setDetail(`No se pudo leer VAPID (${vapidRes.status}).`);
        return;
      }
      const vapid = (await vapidRes.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!alive()) return;
      if (!vapid.configured || !vapid.publicKey) {
        setState("unavailable");
        setDetail(
          "Faltan VAPID en este deploy (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY) o no se rebuildó tras setearlas.",
        );
        return;
      }

      const reg = await ensureOpsServiceWorker();
      if (!alive()) return;
      const existing = await reg.pushManager.getSubscription();
      if (!alive()) return;
      if (existing) {
        const sync = await fetch("/api/ops/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: existing.endpoint,
            keys: {
              p256dh: existing.toJSON().keys?.p256dh,
              auth: existing.toJSON().keys?.auth,
            },
          }),
        });
        if (!alive()) return;
        if (!sync.ok) {
          setState("unavailable");
          setDetail(
            `Hay suscripción local pero el server no la guardó (${sync.status}).`,
          );
          return;
        }
        setState("subscribed");
        setDetail(null);
        return;
      }

      if (Notification.permission === "denied") {
        setState("denied");
        setDetail(null);
        return;
      }

      if (wasDismissed()) {
        setState("hidden");
        setDetail(null);
        return;
      }

      setState("prompt");
      setDetail(null);
    } catch (error) {
      console.warn("[ops] push init", error);
      if (!alive()) return;
      setState("unavailable");
      setDetail(
        error instanceof Error
          ? error.message
          : "Error al inicializar push.",
      );
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    // Diferir fuera del body síncrono del effect (eslint react-hooks/set-state-in-effect).
    const id = window.setTimeout(() => {
      void refresh(signal);
    }, 0);
    return () => {
      signal.cancelled = true;
      window.clearTimeout(id);
    };
  }, [refresh]);

  async function enable() {
    setState("loading");
    setDetail(null);
    clearDismissed();
    try {
      const vapidRes = await fetch("/api/ops/push/vapid");
      const vapid = (await vapidRes.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!vapid.configured || !vapid.publicKey) {
        setState("unavailable");
        setDetail("VAPID no configurado en este deploy.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "prompt");
        return;
      }

      const reg = await ensureOpsServiceWorker();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapid.publicKey,
        ) as BufferSource,
      });
      const json = sub.toJSON();
      const res = await fetch("/api/ops/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
          },
        }),
      });
      if (!res.ok) {
        setState("unavailable");
        setDetail(`Subscribe falló (${res.status}).`);
        return;
      }
      setState("subscribed");
    } catch (error) {
      console.warn("[ops] push subscribe failed", error);
      setState("unavailable");
      setDetail(
        error instanceof Error ? error.message : "No se pudo suscribir",
      );
    }
  }

  function dismiss() {
    markDismissed();
    setState("hidden");
  }

  if (state === "loading") {
    return (
      <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-2">
        <p className="mx-auto max-w-lg font-sans text-xs text-secondary">
          Revisando notificaciones…
        </p>
      </div>
    );
  }

  if (state === "hidden") {
    return (
      <div className="border-b border-outline-variant/40 bg-surface-container/60 px-4 py-2">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <p className="font-sans text-xs text-secondary">
            Avisos push ocultos
          </p>
          <button
            type="button"
            onClick={() => {
              clearDismissed();
              void refresh();
            }}
            className="font-sans text-xs text-primary underline-offset-2 hover:underline"
          >
            Mostrar
          </button>
        </div>
      </div>
    );
  }

  if (state === "subscribed") {
    return (
      <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-2">
        <p className="mx-auto max-w-lg font-sans text-xs text-secondary">
          Notificaciones de días especiales:{" "}
          <span className="font-semibold text-foreground">activas</span>
        </p>
      </div>
    );
  }

  if (state === "unavailable" || state === "unsupported") {
    return (
      <div className="border-b border-outline-variant/40 bg-primary/10 px-4 py-3">
        <div className="mx-auto max-w-lg">
          <p className="font-display text-sm font-semibold text-foreground">
            Push no disponible
          </p>
          <p className="mt-0.5 font-sans text-xs leading-relaxed text-secondary">
            {detail ?? "No se pudieron activar las notificaciones."}
          </p>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-3">
        <div className="mx-auto max-w-lg">
          <p className="font-display text-sm font-semibold text-foreground">
            Notificaciones bloqueadas
          </p>
          <p className="mt-0.5 font-sans text-xs text-secondary">
            Activálas en los ajustes del navegador / del sistema para esta app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-3">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-foreground">
            Avisos de días especiales
          </p>
          <p className="mt-0.5 font-sans text-xs text-secondary">
            Recibí una push al entrar en la ventana y recordatorios periódicos
            hasta el día.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void enable()}
            className="rounded bg-primary px-3 py-2 font-display text-xs font-semibold text-on-primary"
          >
            Activar
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded px-2 py-2 font-sans text-xs text-secondary hover:text-foreground"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
