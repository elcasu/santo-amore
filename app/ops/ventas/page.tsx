import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OfflineSalesPanel } from "@/components/ops/offline-sales-panel";
import { OpsNav } from "@/components/ops/ops-nav";
import {
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";
import { listOfflineSales } from "@/lib/ops/offline-sales";
import { listOpsSaleProducts } from "@/lib/ops/products";

export const metadata = {
  title: "Ops · Ventas",
  robots: { index: false, follow: false },
};

export default async function OpsVentasPage() {
  if (!isOpsGateEnabled()) {
    redirect("/ops/login");
  }

  const jar = await cookies();
  if (!(await isValidOpsCookie(jar.get(OPS_COOKIE_NAME)?.value))) {
    redirect("/ops/login");
  }

  const [products, sales] = await Promise.all([
    listOpsSaleProducts(),
    listOfflineSales(),
  ]);

  return (
    <>
      <OpsNav active="sales" />
      <OfflineSalesPanel initialProducts={products} initialSales={sales} />
    </>
  );
}
