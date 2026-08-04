import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getSiteSettings } from "@/lib/data";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = await getSiteSettings();
  const { locationLabel, countryCode } = settings;

  return (
    <CartProvider>
      <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <div aria-hidden className="grain-overlay" />
        <SiteHeader
          locationLabel={locationLabel}
          countryCode={countryCode}
        />
        <main className="relative z-10 flex-1 pt-[88px] sm:pt-[64px] md:pt-[72px]">
          {children}
        </main>
        <SiteFooter
          locationLabel={locationLabel}
          countryCode={countryCode}
        />
        <CartDrawer />
        <WhatsAppFab />
      </div>
    </CartProvider>
  );
}
