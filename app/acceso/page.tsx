type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export const metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function AccesoPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <p className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-primary">
          Staging
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
          Santo Amore
        </h1>
        <p className="mb-8 font-sans text-sm text-secondary">
          Este entorno está protegido. Ingresá la contraseña para continuar.
        </p>

        {error ? (
          <p
            className="mb-4 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary"
            role="alert"
          >
            Contraseña incorrecta.
          </p>
        ) : null}

        <form action="/api/acceso" method="post" className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="mb-2 block font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-secondary">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              className="w-full rounded border border-outline-variant bg-white px-4 py-3 font-sans text-foreground outline-none ring-primary focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-3 font-display text-base font-semibold text-white transition-colors hover:bg-primary-container"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
