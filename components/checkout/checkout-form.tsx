"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatPriceArs } from "@/lib/data";

type FieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "address"
    | "city"
    | "province"
    | "postalCode"
    | "form",
    string
  >
>;

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, hydrated, itemCount } = useCart();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-secondary">Cargando carrito…</p>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="border border-outline-variant/40 bg-surface-container/40 px-6 py-16 text-center">
        <p className="mb-6 font-sans text-base text-secondary">
          Tu carrito está vacío.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center bg-foreground px-8 py-3 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setPending(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
          })),
          customer: { name, email, phone },
          shipping: { address, city, province, postalCode, notes },
        }),
      });

      const data = (await res.json()) as {
        initPoint?: string;
        error?: string;
      };

      if (!res.ok || !data.initPoint) {
        setErrors({ form: data.error ?? "No se pudo iniciar el pago." });
        setPending(false);
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setErrors({ form: "Error de red. Intentá de nuevo." });
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded border border-outline-variant bg-white px-4 py-3 font-sans text-sm text-foreground outline-none ring-primary focus:ring-2";
  const labelClass =
    "mb-1.5 block font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-secondary";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-12 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-10">
        <section>
          <h2 className="mb-6 font-display text-xl font-semibold text-foreground">
            Contacto
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
            Envío
          </h2>
          <p className="mb-6 font-sans text-sm text-secondary">
            El costo de envío se coordina luego. Completá tu dirección de
            entrega.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClass}>
                Dirección
              </label>
              <input
                id="address"
                name="address"
                required
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>
                Ciudad
              </label>
              <input
                id="city"
                name="city"
                required
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="province" className={labelClass}>
                Provincia
              </label>
              <input
                id="province"
                name="province"
                required
                autoComplete="address-level1"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className={labelClass}>
                Código postal
              </label>
              <input
                id="postalCode"
                name="postalCode"
                required
                autoComplete="postal-code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className={labelClass}>
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="h-fit border border-outline-variant/40 bg-surface-container/40 p-6 lg:sticky lg:top-28">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          Tu pedido
        </h2>
        <ul className="mb-4 space-y-3 border-b border-outline-variant/40 pb-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between gap-3 font-sans text-sm"
            >
              <span className="text-secondary">
                {item.title} × {item.qty}
              </span>
              <span className="shrink-0 text-foreground">
                {formatPriceArs(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mb-2 flex justify-between font-sans text-sm">
          <span className="text-secondary">Subtotal</span>
          <span className="font-display text-lg font-semibold text-foreground">
            {formatPriceArs(subtotal)}
          </span>
        </div>
        <p className="mb-6 font-sans text-xs text-secondary">
          Envío a coordinar · Pago seguro con MercadoPago
        </p>

        {errors.form ? (
          <p className="mb-4 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-sans text-sm text-primary">
            {errors.form}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mb-3 flex w-full items-center justify-center bg-foreground px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Redirigiendo…" : "Pagar con MercadoPago"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/carrito")}
          className="flex w-full items-center justify-center font-sans text-xs font-bold uppercase tracking-[0.12em] text-primary"
        >
          Volver al carrito
        </button>
      </aside>
    </form>
  );
}
