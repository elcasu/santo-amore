import { buildWhatsAppUrl } from "@/lib/whatsapp";

export type TransactionalEmailFooterOptions = {
  siteUrl?: string;
  year?: number;
  logoUrl?: string;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  legalNotice?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getHttpUrl(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getSiteUrl(siteUrl?: string): URL {
  const value = siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL;
  const parsed = getHttpUrl(value);

  if (!parsed) {
    throw new Error(
      "Se necesita una URL pública válida para generar el pie del email.",
    );
  }

  return new URL(parsed);
}

function renderLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:#5f5e5e;text-decoration:underline;text-decoration-color:#e5beb8;text-underline-offset:3px;">${escapeHtml(label)}</a>`;
}

/**
 * Genera un pie HTML para emails transaccionales.
 *
 * Usa tablas y estilos inline para conservar el diseño en Gmail, Outlook y
 * Apple Mail. La URL del sitio debe ser pública para que el logo sea visible.
 */
export function renderTransactionalEmailFooter(
  options: TransactionalEmailFooterOptions = {},
): string {
  const siteUrl = getSiteUrl(options.siteUrl);
  const year = options.year ?? new Date().getFullYear();
  const logoUrl =
    getHttpUrl(options.logoUrl) ??
    new URL("/brand/logo-header-img.png", siteUrl).toString();
  const instagramUrl = getHttpUrl(
    options.instagramUrl ?? process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  );
  const whatsappUrl = getHttpUrl(
    options.whatsappUrl ?? buildWhatsAppUrl({ text: "" }),
  );
  const legalNotice =
    options.legalNotice ??
    "Recibís este mensaje porque realizaste una compra o una consulta en Santo Amore.";

  const primaryLinks = [
    renderLink(new URL("/catalogo", siteUrl).toString(), "Catálogo"),
    renderLink(new URL("/envios", siteUrl).toString(), "Envíos"),
    renderLink(new URL("/contacto", siteUrl).toString(), "Contacto"),
  ];
  const socialLinks = [
    instagramUrl ? renderLink(instagramUrl, "Instagram") : null,
    whatsappUrl ? renderLink(whatsappUrl, "WhatsApp") : null,
  ].filter((link): link is string => Boolean(link));

  const socialRow =
    socialLinks.length > 0
      ? `
                    <tr>
                      <td align="center" style="padding:10px 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#5f5e5e;">
                        ${socialLinks.join("&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;")}
                      </td>
                    </tr>`
      : "";

  return `
<!-- Santo Amore · pie de email transaccional -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0;background-color:#fbf9f8;">
  <tr>
    <td align="center" style="padding:0 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-top:1px solid #e5beb8;">
        <tr>
          <td align="center" style="padding:30px 24px 8px;">
            <a href="${escapeHtml(siteUrl.toString())}" style="text-decoration:none;">
              <img src="${escapeHtml(logoUrl)}" width="112" alt="Santo Amore" style="display:block;width:112px;max-width:100%;height:auto;border:0;">
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;line-height:18px;letter-spacing:1.4px;text-transform:uppercase;color:#b71511;">
            Artisanal Soul, Modern Grace
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:18px 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#5f5e5e;">
            ${primaryLinks.join("&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;")}
          </td>
        </tr>${socialRow}
        <tr>
          <td align="center" style="padding:20px 24px 30px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#777575;">
            ${escapeHtml(legalNotice)}<br>
            © ${escapeHtml(String(year))} Santo Amore. Todos los derechos reservados.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}
