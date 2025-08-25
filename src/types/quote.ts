import type { CartItem } from './order';

export interface Quote {
  id: string;
  userId: string | number | null;
  status: string;
  createdAt: string;
  cart?: {
    items: CartItem[];
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

