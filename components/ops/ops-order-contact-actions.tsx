"use client";

import { useState } from "react";

import {
  formatPhoneDisplay,
  getOpsInboxUrl,
  normalizeWhatsAppPhone,
} from "@/lib/whatsapp";

export function OpsOrderContactActions({
  phone,
}: {
  phone?: string | null;
}) {
  const inboxUrl = getOpsInboxUrl();
  const digits = normalizeWhatsAppPhone(phone);
  const display = formatPhoneDisplay(phone) || phone?.trim() || null;
  const [copied, setCopied] = useState(false);

  if (!inboxUrl && !display) return null;

  async function copyPhone() {
    if (!digits && !phone) return;
    const value = digits || phone!.trim();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="font-sans text-xs leading-relaxed text-secondary">
        Responder siempre desde el Inbox, no desde WhatsApp personal.
      </p>
      <div className="flex flex-wrap gap-2">
        {inboxUrl ? (
          <a
            href={inboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-primary px-3 py-2.5 font-display text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Contactar en inbox
          </a>
        ) : null}
        {display ? (
          <button
            type="button"
            onClick={copyPhone}
            className="rounded bg-surface-container px-3 py-2.5 font-display text-sm font-semibold text-foreground transition-colors hover:bg-surface-container-high"
          >
            {copied ? "Copiado" : "Copiar teléfono"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
