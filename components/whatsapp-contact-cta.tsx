import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppContactCta() {
  const href = buildWhatsAppUrl();
  if (!href) return null;

  return (
    <p className="mt-10">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 font-display text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Escribinos por WhatsApp
      </a>
    </p>
  );
}
