// src/types/order.ts

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface CheckoutSession {
  id: string;
  url?: string;
  customer: { name?: string | null } | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedPrice: number;
}

export interface Order {
  id: number;
  products: Product[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}
