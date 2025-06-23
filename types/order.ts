export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CheckoutSession {
  id: string;
  url?: string;
  customer: { name?: string | null } | null;
}
