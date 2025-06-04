// components/FeaturedProductsCarousel.tsx
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
};

type Props = {
  products: Product[];
};

export default function FeaturedProductsCarousel({ products }: Props) {
  return (
    <section className="featured-products-carousel">
      <h2>Featured Products</h2>
      <div className="carousel">
        {products.map((product) => (
          <a key={product.id} href={`/products/${product.slug}`} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
