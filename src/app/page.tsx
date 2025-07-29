// src/app/page.tsx
import Image from 'next/image';
import { getCategories } from '@/bff/services';
import Link from 'next/link';
import PopularProductsCarousel from '@/components/PopularProductsCarousel';
import HeroBanner from '@/components/HeroBanner';
// import { slugify } from '@/lib/utils'; // Not needed for category slugs if fetched as objects

interface CategoryInfo { // This interface might need adjustment or can use CategorySchema directly
  name: string;
  slug: string;
  // Add a placeholder image URL or a way to derive one if needed for display
  imageUrl?: string;
}

// Placeholder images for categories - replace with actual or better logic if available
const categoryImagePlaceholders: Record<string, string> = {
  'smartphones': 'https://cdn.dummyjson.com/products/images/smartphones/iPhone%20X/1.webp',
  'laptops': 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp',
  'fragrances': 'https://cdn.dummyjson.com/products/images/fragrances/Chanel%20Coco%20Noir%20Eau%20De%20Parfum/1.webp',
  'groceries': 'https://cdn.dummyjson.com/products/images/groceries/Apple%20Red/1.webp',
  'home-decoration': 'https://cdn.dummyjson.com/products/images/home-decoration/FamilyTreePhotoFrame/1.webp',
  'furniture': 'https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Bed/1.webp',
  'tops': 'https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp',
  'womens-dresses': 'https://cdn.dummyjson.com/product-images/womens-dresses/black-women\\\'s-gown/thumbnail.webp',
  'womens-shoes': 'https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes/thumbnail.webp',
  'mens-shirts': 'https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp',
  'mens-shoes': 'https://cdn.dummyjson.com/products/images/mens-shoes/Nike%20Air%20Jordan%201%20Low%20Golf%20Wolf%20Grey/1.webp',
  'mens-watches': 'https://cdn.dummyjson.com/products/images/mens-watches/Rolex%20Cellini%20Moonphase%20Watch/1.webp',
  'womens-watches': 'https://cdn.dummyjson.com/products/images/womens-watches/Rolex%20Datejust%2028mm%20Automatic%20Diamond%20Ladies%20Watch/1.webp',
  'womens-bags': 'https://cdn.dummyjson.com/products/images/womens-bags/Louis%20Vuitton%20Monogram%20Bag/1.webp',
  'womens-jewellery': 'https://cdn.dummyjson.com/products/images/womens-jewellery/Sliver%20Earrings%20With%20Stone/1.webp',
  'sunglasses': 'https://cdn.dummyjson.com/products/images/sunglasses/Goldsmith%20BLACK%20Fashion%20Frame%20గ్లాసెస్/1.webp',
  'automotive': 'https://cdn.dummyjson.com/products/images/automotive/Ford%20Raptor%20F-150%20Lightning%20SuperCrew/1.webp',
  'motorcycle': 'https://cdn.dummyjson.com/products/images/motorcycle/Kawasaki%20Ninja%20H2R/1.webp',
  'lighting': 'https://cdn.dummyjson.com/products/images/lighting/Table%20Lamp%20Night%20Light%20Bedside%20Desk%20Lamp/1.webp',
  // New and updated entries
  'beauty': 'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
  'kitchen-accessories': 'https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/thumbnail.webp',
  'mobile-accessories': 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp',
  'skin-care': 'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp',
  'sports-accessories': 'https://cdn.dummyjson.com/product-images/sports-accessories/basketball/thumbnail.webp',
  'tablets': 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp',
  'vehicle': 'https://cdn.dummyjson.com/product-images/vehicle/dodge-hornet-gt-plus/thumbnail.webp',
  // Add more as needed or implement a default for categories not listed above
};
const defaultCategoryImage = 'https://cdn.dummyjson.com/products/images/mobile-accessories/Apple%20Airpods%20Pro%20Case%20Cover/1.webp';


export default async function HomePage() {
  let categoriesToDisplay: CategoryInfo[] = []; // Use CategoryInfo or adapt
  let fetchError: string | null = null;

  try {
    // getCategories now returns { id, name, slug }[]
    const fetchedCategories: { id: number; name: string; slug: string }[] = await getCategories();

    categoriesToDisplay = fetchedCategories.map(category => ({
      name: category.name, // Use pre-formatted name
      slug: category.slug,  // Use slug directly
      imageUrl: categoryImagePlaceholders[category.slug] || defaultCategoryImage,
    }));
  } catch (error) {
    console.error("Failed to fetch categories for HomePage:", error);
    fetchError = "Could not load categories at this time. Please try again later.";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroBanner
        title="Welcome to Forte!"
        description="Discover amazing products across all categories. Built with Next.js 14 and modern tech."
        ctaText="Shop Now"
        ctaLink={categoriesToDisplay.length > 0 ? `/category/${categoriesToDisplay[0].slug}` : "/"}
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        imageAlt="A group of people working on laptops"
      />

      {/* Popular Products Carousel */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <PopularProductsCarousel />
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Featured Categories
          </h2>
          {fetchError && (
            <div className="text-center text-red-500 mb-12">
              <p>{fetchError}</p>
            </div>
          )}
          {categoriesToDisplay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {categoriesToDisplay.map((category) => (
                <Link key={category.slug} href={`/category/${category.slug}`} legacyBehavior>
                  <a className="group block bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-w-1 aspect-h-1 w-full relative"> {/* Added relative positioning for Image fill */}
                      {category.imageUrl && (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          placeholder="blur"
                          blurDataURL="/img/placeholder.svg"
                        />
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-md sm:text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            !fetchError && <p className="text-center text-gray-600">Loading categories or no categories found.</p>
          )}
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500 border-t">
        <p>&copy; {new Date().getFullYear()} BetaStore. All rights reserved.</p>
      </footer>
    </div>
  );
}
