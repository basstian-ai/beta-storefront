// src/app/product/[slug]/page.tsx - Renamed and modified
import { getProductByIdOrSlug, getProducts } from '@/bff/services'; // Use new name
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import CopyLinkButton from '@/components/CopyLinkButton';
import PriceBox from '@/components/PriceBox';
import Gallery from '@/components/Gallery';
import { slugify } from '@/lib/utils'; // Ensure slugify is available if needed as fallback

// ensureCacheReady might be needed for generateStaticParams if products don't have slugs yet
// However, getProducts is now modified to add slugs, so it should be fine.
// If getProducts didn't add slugs, we'd do:
// import { ensureCacheReady } from '@/bff/services'; // (If services exported it)

export async function generateStaticParams() {
  try {
    // await ensureCacheReady(); // If needed
    const { items: products } = await getProducts({ limit: 10 }); // getProducts now adds slugs
    return products.map((product) => ({
      slug: product.slug || slugify(product.title), // Use slug from product, fallback to generating one
    }));
  } catch (error) {
    console.error("Failed to generate static params for product pages:", error);
    return [];
  }
}

interface ProductPageProps {
  params: { slug: string }; // Changed from id to slug
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params; // Use slug from params
  let product: z.infer<typeof ProductSchema>;

  try {
    product = await getProductByIdOrSlug(slug); // Call updated service
  } catch (error) {
    console.error(`Failed to fetch product by slug "${slug}":`, error);
    return notFound(); // Triggers the not-found page
  }

  if (!product) {
    return notFound();
  }

  // LD+JSON Script Enhancements
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const productLdJson = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images && product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : undefined),
    "description": product.description,
    "sku": String(product.id),
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Unknown Brand"
    },
    "offers": {
      "@type": "Offer",
      // Ensure product.slug is available and correctly populated
      "url": `https://beta-store.vercel.app/product/${product.slug}`, // Using product.slug
      "priceCurrency": product.effectivePrice?.currencyCode || "USD",
      "price": product.effectivePrice?.amount ?? product.price, // Use effectivePrice amount, fallback to list price
      "itemCondition": "https://schema.org/NewCondition", // Added itemCondition
      "availability": product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": thirtyDaysFromNow.toISOString().split('T')[0], // Added priceValidUntil (YYYY-MM-DD format)
    },
    "seller": { // Added seller
      "@type": "Organization",
      "name": "BetaStore"
    }
    // TODO: Add reviews, aggregateRating if available in future
  };

  const categoryDisplayName = product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        categoryName={categoryDisplayName}
        productTitle={product.title}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLdJson) }}
      />

      <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-x-8 items-start">
        <div className="lg:col-span-1">
          <Gallery images={product.images} title={product.title} />
        </div>

        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.title}</h1>

          {product.brand && <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>}

          <PriceBox product={product} />

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Description</h3>
            <div
              className="prose prose-sm sm:prose-base max-w-none whitespace-pre-line text-gray-700"
            >
              {product.description}
            </div>
          </div>

          {/* Stock display is now part of PriceBox, so removed from here */}

          <div className="mt-6">
            <button type="button" className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add to Cart (TBD)
            </button>
            <CopyLinkButton />
          </div>

        </div>
      </div>
    </div>
  );
}
