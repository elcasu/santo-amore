import type { Metadata, Viewport } from "next";

import { OpsInstallBanner } from "@/components/ops/ops-install-banner";
import { OpsSpecialDaysBanner } from "@/components/ops/ops-special-days-banner";
import { OpsServiceWorkerRegister } from "@/components/ops/ops-sw-register";

export const metadata: Metadata = {
  title: "Ops",
  robots: { index: false, follow: false },
  applicationName: "Santo Amore Ops",
  manifest: "/ops/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SA Ops",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/ops/icons/apple-touch-icon.png",
    icon: [
      { url: "/ops/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/ops/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#b71511",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <OpsServiceWorkerRegister />
      <OpsSpecialDaysBanner />
      <OpsInstallBanner />
      {children}
    </div>
  );
}
