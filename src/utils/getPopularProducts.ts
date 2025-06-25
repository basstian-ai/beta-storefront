export interface PopularProduct {
  id: number;
  title: string;
  price: number;
  discountPercentage: number;
  thumbnail: string;
  rating: number;
  blurDataURL: string;
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
  const products: Omit<PopularProduct, 'blurDataURL'>[] = Array.isArray(
    data.products
  )
    ? data.products
    : [];

  const addBlur = (p: Omit<PopularProduct, 'blurDataURL'>): PopularProduct => ({
    ...p,
    blurDataURL: generateTinyBlur(p.id),
  });

  return products
    .map(addBlur)
    .sort((a, b) => b.rating - a.rating);
}

function generateTinyBlur(id: number): string {
  const shade = 220 + (id * 5) % 20; // light gray variation
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='rgb(${shade},${shade},${shade})'/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
