import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <div aria-hidden className="grain-overlay" />
        <SiteHeader />
        <main className="relative z-10 flex-1 pt-[64px] md:pt-[72px]">
          {children}
        </main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
