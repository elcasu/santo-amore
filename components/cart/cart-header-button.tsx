"use client";

import { useCart } from "@/components/cart/cart-provider";

export function CartHeaderButton() {
  const { itemCount, hydrated, openDrawer } = useCart();
  const showBadge = hydrated && itemCount > 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative flex items-center justify-center text-foreground transition-colors hover:text-primary"
      aria-label={
        showBadge ? `Abrir carrito, ${itemCount} piezas` : "Abrir carrito"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-5"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l-1 11H6L5 9Z"
        />
      </svg>
      {showBadge ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-sans text-[10px] font-bold leading-none text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </button>
  );
}
