export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type CheckoutShipping = {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
};

export type CheckoutCartLine = {
  productId: string;
  qty: number;
};

export type ValidatedOrderItem = {
  productId: string;
  title: string;
  slug: string;
  sku?: string;
  qty: number;
  unitPrice: number;
  /** Snapshot del costo al checkout; undefined si el producto no tenía unitCost. */
  unitCost?: number;
};

export type OrderStatus = "pending" | "paid" | "rejected" | "cancelled";
