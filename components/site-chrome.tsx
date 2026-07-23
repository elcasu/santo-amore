import Image from "next/image";
import Link from "next/link";

import { CartHeaderButton } from "@/components/cart/cart-header-button";

const nav = [
  { href: "/catalogo", label: "Colecciones" },
  { href: "/catalogo?categoria=accesorios", label: "Accesorios" },
  { href: "/nosotros", label: "Heritage" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/30 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-2 md:px-16">
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

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-sans text-sm text-foreground transition-colors hover:text-primary"
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
    </header>
  );
}

export function SiteFooter() {
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
