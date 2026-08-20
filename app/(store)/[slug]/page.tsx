import { notFound } from "next/navigation";

import { WhatsAppContactCta } from "@/components/whatsapp-contact-cta";
import { getPageBySlug } from "@/lib/data";
import type { PortableTextBlock } from "@/lib/types/content";

const KNOWN_SLUGS = new Set(["nosotros", "envios", "contacto"]);

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...KNOWN_SLUGS].map((slug) => ({ slug }));
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (!KNOWN_SLUGS.has(slug)) notFound();

  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-16">
      <p className="mb-3 font-sans text-sm text-secondary">Santo Amore</p>
      <h1 className="mb-4 font-display text-4xl font-medium tracking-tight text-foreground md:text-5xl">
        {page.title}
      </h1>
      {page.excerpt ? (
        <p className="mb-10 font-sans text-lg text-secondary">{page.excerpt}</p>
      ) : null}
      <div className="space-y-5">
        {page.body?.map((block) => (
          <PortableParagraph key={block._key} block={block} />
        ))}
      </div>
      {slug === "contacto" ? <WhatsAppContactCta /> : null}
    </article>
  );
}

function PortableParagraph({ block }: { block: PortableTextBlock }) {
  const text = block.children.map((c) => c.text).join("");
  return (
    <p className="font-sans text-base leading-relaxed text-secondary">{text}</p>
  );
}
