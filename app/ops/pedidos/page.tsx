import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OpsNav } from "@/components/ops/ops-nav";
import { OrdersPanel } from "@/components/ops/orders-panel";
import {
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";
import { listOpsOrders } from "@/lib/ops/orders";

export const metadata = {
  title: "Ops · Pedidos",
  robots: { index: false, follow: false },
};

export default async function OpsOrdersPage() {
  if (!isOpsGateEnabled()) {
    redirect("/ops/login");
  }

  const jar = await cookies();
  if (!(await isValidOpsCookie(jar.get(OPS_COOKIE_NAME)?.value))) {
    redirect("/ops/login");
  }

  const orders = await listOpsOrders();

  return (
    <>
      <OpsNav active="orders" />
      <OrdersPanel initialOrders={orders} />
    </>
  );
}
