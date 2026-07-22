import Image from "next/image";

/** Landing histórica “sitio en construcción” (Artisanal). */
export default function ComingSoonPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white text-foreground">
      <div aria-hidden className="grain-overlay" />

      <header className="relative z-40 flex w-full items-center justify-center bg-surface-container px-6 py-2 shadow-[0_0px_20px_-12px_rgba(30,27,24,0.28)] md:px-20">
        <Image
          src="/brand/logo-header.png"
          alt="Santo Amore"
          width={320}
          height={320}
          priority
          unoptimized
          className="h-28 w-auto object-contain md:h-36"
        />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center bg-white px-6 py-8 text-center md:px-20 md:py-16">
        <h1 className="animate-fade-rise mb-4 font-display text-[24px] font-semibold uppercase tracking-[0.2em] text-primary md:text-[28px]">
          Sitio en Construcción
        </h1>
        <div className="animate-fade-rise mb-4 flex flex-col items-center gap-4">
          <div className="w-[200px] opacity-80 md:w-[240px]">
            <Image
              src="/brand/illustration-artisan-transparent.png"
              alt="Ilustración artesanal"
              width={480}
              height={480}
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            Estamos trabajando en ello
          </p>
        </div>
      </main>

      <footer className="relative z-40 flex w-full flex-col items-center justify-between gap-8 border-t border-outline-variant/20 bg-surface-container px-6 py-8 md:flex-row md:px-20">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="font-display text-2xl font-semibold text-primary">
            Santo Amore
          </span>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-muted/60">
            © {new Date().getFullYear()} Santo Amore.
          </p>
        </div>
      </footer>
    </div>
  );
}
