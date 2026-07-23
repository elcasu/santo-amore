export type CartItemImage = {
  src: string;
  alt?: string;
};

/** Line item with a product snapshot so drawer/page work without refetch. */
export type CartItem = {
  productId: string;
  qty: number;
  title: string;
  slug: string;
  price: number;
  image?: CartItemImage;
  maxQty: number;
};

export type CartState = {
  items: CartItem[];
};

export type AddToCartInput = {
  productId: string;
  qty: number;
  title: string;
  slug: string;
  price: number;
  image?: CartItemImage;
  maxQty: number;
};
