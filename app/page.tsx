import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white text-foreground">
      <div aria-hidden className="grain-overlay" />

      <header className="header-fade relative z-40 flex w-full items-center justify-center px-6 py-2 md:px-20">
        <Image
          src="/brand/logo-header.png"
          alt="Santo Amore"
          width={320}
          height={320}
          priority
          unoptimized
          className="h-28 w-auto object-contain transition-transform duration-700 hover:scale-105 md:h-36"
        />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center bg-white px-6 py-8 text-center md:px-20 md:py-16">
        <h1 className="animate-fade-rise mb-4 font-display text-[24px] font-semibold uppercase tracking-[0.2em] text-primary md:text-[28px]">
          Sitio en Construcción
        </h1>

        <div
          className="animate-fade-rise mb-4 flex flex-col items-center gap-4"
          style={{ animationDelay: "120ms" }}
        >
          <div className="w-[200px] opacity-80 transition-transform duration-700 hover:scale-105 md:w-[240px]">
            <Image
              src="/brand/illustration-artisan-transparent.png"
              alt="Ilustración artesanal"
              width={480}
              height={480}
              priority
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

        <div className="hidden">
          <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-muted">
              The Atelier
            </span>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-muted">
              Journal
            </span>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-muted">
              Bespoke Service
            </span>
          </nav>

          <div className="flex gap-6 text-muted">
            <ShareIcon />
            <MailIcon />
            <PinIcon />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path
        d="M8.5 13.2 15.5 17.2M15.5 6.8 8.5 10.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );
}
