export interface PopularProduct {
  id: number;
  title: string;
  price: number;
  discountPercentage: number;
  thumbnail: string;
  rating: number;
}

export async function getPopularProducts(): Promise<PopularProduct[]> {
  const res = await fetch(
    'https://dummyjson.com/products?limit=5&select=id,title,price,discountPercentage,thumbnail,rating',
    {
      next: { revalidate: 60 * 60 * 12 },
    }
  );
  if (!res.ok) {
    throw new Error('Failed to fetch popular products');
  }
  const data = await res.json();
  const products: PopularProduct[] = Array.isArray(data.products)
    ? data.products
    : [];
  return products.sort((a, b) => b.rating - a.rating);
}
