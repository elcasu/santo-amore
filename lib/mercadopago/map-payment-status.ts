import type { OrderStatus } from "@/lib/checkout/types";

export function mapPaymentStatus(status: string | undefined): OrderStatus | null {
  switch (status) {
    case "approved":
      return "paid";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      // pending / in_process / etc. — keep order pending
      return null;
  }
}
