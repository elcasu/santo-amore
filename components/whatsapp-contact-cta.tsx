import { buildWhatsAppUrl } from "@/lib/whatsapp";

const variants = {
  primary:
    "inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 font-display text-sm font-medium text-on-primary transition-opacity hover:opacity-90",
  secondary:
    "inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-6 py-3.5 font-display text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary",
} as const;

export function WhatsAppContactCta({
  text,
  label = "Escribinos por WhatsApp",
  className = "mt-10",
  variant = "primary",
}: {
  text?: string;
  label?: string;
  className?: string;
  variant?: keyof typeof variants;
}) {
  const href = buildWhatsAppUrl(text === undefined ? undefined : { text });
  if (!href) return null;

  return (
    <p className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={variants[variant]}
      >
        {label}
      </a>
    </p>
  );
}
