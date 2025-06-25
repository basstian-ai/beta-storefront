import { getPopularProducts } from '@/utils/getPopularProducts';
import CarouselClient from './PopularProductsCarouselClient';

export default async function PopularProductsCarousel() {
  const products = await getPopularProducts();
  if (!products.length) return null;
  return <CarouselClient products={products} />;
}
