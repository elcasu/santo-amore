import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <div aria-hidden className="grain-overlay" />
      <SiteHeader />
      <main className="relative z-10 flex-1 pt-[72px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
