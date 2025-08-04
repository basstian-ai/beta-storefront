export interface HistoryRecord {
  id: string;
  userId: string | number | null;
  type: 'order' | 'quote';
  status: string;
  createdAt: string;
  session?: import('./order').CheckoutSession;
  cart?: { items: import('./order').CartItem[] };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}
