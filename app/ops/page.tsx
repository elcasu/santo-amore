import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OpsNav } from "@/components/ops/ops-nav";
import { ProductsPanel } from "@/components/ops/products-panel";
import {
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";
import { listOpsProducts } from "@/lib/ops/products";

export const metadata = {
  title: "Ops · Productos",
  robots: { index: false, follow: false },
};

export default async function OpsProductsPage() {
  if (!isOpsGateEnabled()) {
    redirect("/ops/login");
  }

  const jar = await cookies();
  if (!(await isValidOpsCookie(jar.get(OPS_COOKIE_NAME)?.value))) {
    redirect("/ops/login");
  }

  const products = await listOpsProducts();

  return (
    <>
      <OpsNav active="products" />
      <ProductsPanel initialProducts={products} />
    </>
  );
}
