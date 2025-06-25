export interface Cart {
  id: number;
  total: number;
  totalProducts: number;
  totalQuantity: number;
  date?: string;
  products?: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
    total: number;
    discountPercentage?: number;
    discountedTotal?: number;
    thumbnail?: string;
  }>;
}

export async function fetchUserCarts(userId: string | number): Promise<Cart[]> {
  try {
    const res = await fetch(`https://dummyjson.com/carts/user/${userId}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.carts)) return [];
    const carts: Cart[] = data.carts;
    return carts.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA === dateB) {
        return b.id - a.id;
      }
      return dateB - dateA;
    });
  } catch {
    return [];
  }
}
