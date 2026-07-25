import { getMaxQty } from "@/lib/cart/limits";
import type {
  CheckoutCartLine,
  ValidatedOrderItem,
} from "@/lib/checkout/types";
import { getProductPurchaseState } from "@/lib/commerce";
import { getProductById } from "@/lib/data";

export type CartValidationResult =
  | { ok: true; items: ValidatedOrderItem[]; subtotal: number }
  | { ok: false; error: string };

export async function validateCheckoutCart(
  lines: CheckoutCartLine[],
): Promise<CartValidationResult> {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  const items: ValidatedOrderItem[] = [];
  let subtotal = 0;

  for (const line of lines) {
    if (!line?.productId || typeof line.qty !== "number" || line.qty < 1) {
      return { ok: false, error: "Ítem de carrito inválido." };
    }

    const product = await getProductById(line.productId);
    if (!product) {
      return {
        ok: false,
        error: `Producto no encontrado (${line.productId}).`,
      };
    }

    const purchase = getProductPurchaseState(product);
    if (!purchase.canPurchase) {
      return {
        ok: false,
        error: `"${product.title}" no está disponible para compra (${purchase.badgeLabel ?? purchase.status}).`,
      };
    }

    if (typeof product.price !== "number" || product.price < 0) {
      return {
        ok: false,
        error: `"${product.title}" no tiene precio válido.`,
      };
    }

    const maxQty = getMaxQty(product);
    if (line.qty > maxQty) {
      return {
        ok: false,
        error: `"${product.title}" permite máximo ${maxQty} unidad(es).`,
      };
    }

    items.push({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      qty: line.qty,
      unitPrice: product.price,
      unitCost:
        typeof product.unitCost === "number" && product.unitCost >= 0
          ? product.unitCost
          : undefined,
    });
    subtotal += product.price * line.qty;
  }

  return { ok: true, items, subtotal };
}
