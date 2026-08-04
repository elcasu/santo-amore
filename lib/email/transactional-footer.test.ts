import { describe, expect, it } from "vitest";

import { renderTransactionalEmailFooter } from "@/lib/email/transactional-footer";

describe("renderTransactionalEmailFooter", () => {
  it("renders brand links and escapes legal notice", () => {
    const html = renderTransactionalEmailFooter({
      siteUrl: "https://santoamore.com.ar",
      year: 2026,
      instagramUrl: "https://instagram.com/santoamore",
      whatsappUrl: "https://wa.me/54911",
      legalNotice: 'Compra <script> & "ok"',
    });

    expect(html).toContain("Artisanal Soul, Modern Grace");
    expect(html).toContain("https://santoamore.com.ar/catalogo");
    expect(html).toContain("Instagram");
    expect(html).toContain("WhatsApp");
    expect(html).toContain("© 2026 Santo Amore");
    expect(html).toContain("Compra &lt;script&gt; &amp; &quot;ok&quot;");
    expect(html).not.toContain("<script>");
  });

  it("throws without a valid site URL", () => {
    expect(() =>
      renderTransactionalEmailFooter({ siteUrl: "not-a-url" }),
    ).toThrow(/URL pública/);
  });
});
