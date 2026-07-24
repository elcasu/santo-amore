"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallMode = "hidden" | "ios" | "android";

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem("sa_ops_install_dismissed") === "1";
  } catch {
    return false;
  }
}

function getInstallMode(): InstallMode {
  if (isStandalone() || wasDismissed()) return "hidden";
  if (isIos()) return "ios";
  return "android";
}

function subscribeInstallMode() {
  // Sin suscripción a storage: el dismiss local alcanza para esta sesión.
  return () => {};
}

/**
 * Banner liviano: en Android/Chrome usa beforeinstallprompt;
 * en iOS muestra instrucciones de “Agregar a inicio”.
 */
export function OpsInstallBanner() {
  const mode = useSyncExternalStore(
    subscribeInstallMode,
    getInstallMode,
    () => "hidden" as const,
  );
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (mode !== "android") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [mode]);

  function dismiss() {
    setDismissed(true);
    setDeferred(null);
    try {
      sessionStorage.setItem("sa_ops_install_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (dismissed || mode === "hidden") return null;
  if (mode === "android" && !deferred) return null;

  return (
    <div className="border-b border-outline-variant/40 bg-surface-container px-4 py-3">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-foreground">
            Instalar en el teléfono
          </p>
          {deferred ? (
            <p className="mt-0.5 font-sans text-xs text-secondary">
              Queda como app en la pantalla de inicio, sin abrir el navegador.
            </p>
          ) : (
            <p className="mt-0.5 font-sans text-xs leading-relaxed text-secondary">
              En Safari: tocá{" "}
              <strong className="font-semibold text-foreground">
                Compartir
              </strong>{" "}
              →{" "}
              <strong className="font-semibold text-foreground">
                Agregar a pantalla de inicio
              </strong>
              .
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {deferred ? (
            <button
              type="button"
              onClick={() => void install()}
              className="rounded bg-primary px-3 py-2 font-display text-xs font-semibold text-on-primary"
            >
              Instalar
            </button>
          ) : null}
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
