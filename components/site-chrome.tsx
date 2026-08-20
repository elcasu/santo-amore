import Image from "next/image";
import Link from "next/link";

import { CartHeaderButton } from "@/components/cart/cart-header-button";
import { buildCatalogHref } from "@/lib/commerce";

const nav = [
  { href: buildCatalogHref(), label: "Piezas" },
  { href: buildCatalogHref({ disponibilidad: "encargo" }), label: "Encargos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

type ChromeProps = {
  locationLabel: string;
  countryCode: string;
};

export function SiteHeader({ locationLabel }: ChromeProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-5 py-2 md:px-16">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <Link
            href="/"
            className="relative block shrink-0 transition-opacity hover:opacity-90"
            aria-label="Santo Amore — inicio"
          >
            <Image
              src="/brand/logo-santo-amore.png"
              alt="Santo Amore"
              width={160}
              height={160}
              priority
              unoptimized
              className="h-12 w-auto object-contain md:h-14"
            />
          </Link>
          <p className="hidden truncate font-sans text-sm text-secondary sm:block">
            {locationLabel}
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative font-sans text-sm text-foreground transition-colors hover:text-primary after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100 motion-reduce:after:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-foreground">
          <Link
            href={buildCatalogHref()}
            className="font-sans text-sm text-primary md:hidden"
          >
            Piezas
          </Link>
          <CartHeaderButton />
        </div>
      </div>
      <div className="flex justify-center border-t border-outline-variant/25 px-5 py-1.5 sm:hidden">
        <p className="font-sans text-xs text-secondary">{locationLabel}</p>
      </div>
    </header>
  );
}

export function SiteFooter({ locationLabel }: ChromeProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-outline-variant/50 bg-surface-container">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-10 px-5 py-12 md:flex-row md:px-16">
        <div className="text-center md:text-left">
          <p className="font-display text-2xl font-medium text-foreground">
            Santo Amore
          </p>
          <p className="mt-2 font-sans text-sm text-secondary">
            Artisanal Soul, Modern Grace
          </p>
          <p className="mt-3 font-sans text-sm text-foreground">
            Atelier en {locationLabel}
          </p>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <Link
              href="/nosotros"
              className="font-sans text-sm text-secondary transition-colors hover:text-primary"
            >
              Nosotros
            </Link>
            <Link
              href="/envios"
              className="font-sans text-sm text-secondary transition-colors hover:text-primary"
            >
              Envíos
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/contacto"
              className="font-sans text-sm text-secondary transition-colors hover:text-primary"
            >
              Contacto
            </Link>
            <Link
              href={buildCatalogHref()}
              className="font-sans text-sm text-secondary transition-colors hover:text-primary"
            >
              Piezas
            </Link>
          </div>
        </div>

        <p className="font-sans text-sm text-secondary">© {year} Santo Amore</p>
      </div>
    </footer>
  );
}
