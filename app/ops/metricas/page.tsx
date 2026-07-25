import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MetricsPanel } from "@/components/ops/metrics-panel";
import { OpsNav } from "@/components/ops/ops-nav";
import {
  isOpsGateEnabled,
  isValidOpsCookie,
  OPS_COOKIE_NAME,
} from "@/lib/ops-gate";
import { getOpsMetrics, resolveMetricsRange } from "@/lib/ops/metrics";

export const metadata = {
  title: "Ops · Métricas",
  robots: { index: false, follow: false },
};

export default async function OpsMetricsPage() {
  if (!isOpsGateEnabled()) {
    redirect("/ops/login");
  }

  const jar = await cookies();
  if (!(await isValidOpsCookie(jar.get(OPS_COOKIE_NAME)?.value))) {
    redirect("/ops/login");
  }

  const range = resolveMetricsRange({ preset: "30d" });
  const metrics = await getOpsMetrics(range);

  return (
    <>
      <OpsNav active="metrics" />
      <MetricsPanel initialMetrics={metrics} />
    </>
  );
}
