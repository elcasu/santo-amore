"use client";

import { useEffect, useState } from "react";

type PromptState =
  | "hidden"
  | "loading"
  | "prompt"
  | "subscribed"
  | "unsupported"
  | "denied"
  | "unavailable";

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

/**
 * Opt-in a Web Push para avisos de días especiales (requiere SW + VAPID).
 */
export function OpsPushPrompt() {
  const [state, setState] = useState<PromptState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (!window.isSecureContext) {
        if (!cancelled) setState("unsupported");
        return;
      }

      try {
        const vapidRes = await fetch("/api/ops/push/vapid");
        if (!vapidRes.ok) {
          if (!cancelled) setState("unavailable");
          return;
        }
        const vapid = (await vapidRes.json()) as {
          configured?: boolean;
          publicKey?: string | null;
        };
        if (!vapid.configured || !vapid.publicKey) {
          if (!cancelled) setState("unavailable");
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          // Re-sincronizar endpoint por si el backend se limpió.
          await fetch("/api/ops/push/subscribe", {
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
          if (!cancelled) setState("subscribed");
          return;
        }

        if (Notification.permission === "denied") {
          if (!cancelled) setState("denied");
          return;
        }

        if (wasDismissed()) {
          if (!cancelled) setState("hidden");
          return;
        }

        if (!cancelled) setState("prompt");
      } catch {
        if (!cancelled) setState("unavailable");
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setState("loading");
    try {
      const vapidRes = await fetch("/api/ops/push/vapid");
      const vapid = (await vapidRes.json()) as {
        configured?: boolean;
        publicKey?: string | null;
      };
      if (!vapid.configured || !vapid.publicKey) {
        setState("unavailable");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "prompt");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
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
        return;
      }
      setState("subscribed");
    } catch (error) {
      console.warn("[ops] push subscribe failed", error);
      setState("prompt");
    }
  }

  function dismiss() {
    markDismissed();
    setState("hidden");
  }

  if (
    state === "hidden" ||
    state === "loading" ||
    state === "subscribed" ||
    state === "unavailable" ||
    state === "unsupported"
  ) {
    return null;
  }

  if (state === "denied") {
    return (
      <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-3">
        <div className="mx-auto max-w-lg">
          <p className="font-display text-sm font-semibold text-foreground">
            Notificaciones bloqueadas
          </p>
          <p className="mt-0.5 font-sans text-xs text-secondary">
            Activálas en los ajustes del navegador para recibir avisos de días
            especiales.
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
