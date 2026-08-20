import Image from "next/image";
import Link from "next/link";

import { CartHeaderButton } from "@/components/cart/cart-header-button";
import { flagEmojiFromCountryCode } from "@/lib/site/location";

const nav = [
  { href: "/catalogo", label: "Colecciones" },
  { href: "/catalogo?categoria=accesorios", label: "Accesorios" },
  { href: "/nosotros", label: "Heritage" },
  { href: "/contacto", label: "Contacto" },
];

type ChromeProps = {
  locationLabel: string;
  countryCode: string;
};

function LocationMark({
  label,
  countryCode,
  className = "",
}: {
  label: string;
  countryCode: string;
  className?: string;
}) {
  const flag = flagEmojiFromCountryCode(countryCode);

  return (
    <p
      className={`inline-flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-secondary ${className}`}
    >
      <span aria-hidden className="text-[13px] leading-none">
        {flag}
      </span>
      {label}
    </p>
  );
}

export function SiteHeader({ locationLabel, countryCode }: ChromeProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/30 bg-white/80 backdrop-blur-md">
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
          <div className="hidden border-l border-outline-variant/50 pl-3 sm:block md:pl-5">
            <LocationMark
              label={locationLabel}
              countryCode={countryCode}
            />
          </div>
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
            href="/catalogo"
            className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary md:hidden"
          >
            Shop
          </Link>
          <CartHeaderButton />
        </div>
      </div>
      <div className="flex justify-center border-t border-outline-variant/20 px-5 py-1.5 sm:hidden">
        <LocationMark label={locationLabel} countryCode={countryCode} />
      </div>
    </header>
  );
}

export function SiteFooter({ locationLabel, countryCode }: ChromeProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-outline-variant bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-10 px-5 py-12 md:flex-row md:px-16">
        <div className="text-center md:text-left">
          <p className="font-display text-xl font-bold text-foreground">
            Santo Amore
          </p>
          <p className="mt-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
            Artisanal Soul, Modern Grace
          </p>
          <LocationMark
            label={locationLabel}
            countryCode={countryCode}
            className="mt-3 justify-center md:justify-start"
          />
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <Link
              href="/nosotros"
              className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
            >
              Nosotros
            </Link>
            <Link
              href="/envios"
              className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
            >
              Envíos
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/contacto"
              className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
            >
              Contacto
            </Link>
            <Link
              href="/catalogo"
              className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary transition-colors hover:text-primary"
            >
              Catálogo
            </Link>
          </div>
        </div>

        <p className="font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
          © {year} Santo Amore
        </p>
      </div>
    </footer>
  );
}
