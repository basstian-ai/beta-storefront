// src/app/product/[slug]/page.tsx
'use client'; // Convert to Client Component

import { getProductByIdOrSlug } from '@/bff/services'; // Fetch data function
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useParams } from 'next/navigation'; // useParams for client component
import ProductGallery from '@/components/ProductGallery'; // Changed from Gallery to ProductGallery
import PriceBox from '@/components/PriceBox';
import CopyLinkButton from '@/components/CopyLinkButton';
import WishlistButton from '@/components/WishlistButton';
import { useCartStore } from '@/stores/useCartStore'; // Import cart store
import toast from 'react-hot-toast'; // For feedback
import { useEffect, useState } from 'react'; // For client-side data fetching

// generateStaticParams is removed as this is now a client component

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : undefined;

  const [product, setProduct] = useState<z.infer<typeof ProductSchema> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      getProductByIdOrSlug(slug)
        .then(data => {
          setProduct(data);
          setError(null);
        })
        .catch(err => {
          console.error(`Failed to fetch product ${slug}:`, err);
          setError('Product not found or error fetching data.');
          setProduct(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError('Product slug not available.');
      setIsLoading(false);
      // Consider redirecting or showing a more specific "invalid URL" message
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItemToCart(product, 1);
      toast.success(`${product.title} added to cart!`);
    } else {
      toast.error('Product data not available to add to cart.');
    }
  };

  let productLdJsonScript = null;
  if (product) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const productLdJson = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.images && product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : undefined),
        "description": product.description,
        "sku": String(product.id),
        "brand": { "@type": "Brand", "name": product.brand || "Unknown Brand" },
        "offers": {
            "@type": "Offer",
            "url": `https://beta-store.vercel.app/product/${product.slug}`,
            "priceCurrency": product.effectivePrice?.currencyCode || "USD",
            "price": product.effectivePrice?.amount ?? product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceValidUntil": thirtyDaysFromNow.toISOString().split('T')[0],
        },
        "seller": { "@type": "Organization", "name": "BetaStore" }
    };
    productLdJsonScript = (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productLdJson) }}
        />
    );
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading product details...</div>;
  }

  if (error) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-red-500 text-xl">{error}</p>
            <Link href="/" className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Go to Homepage
            </Link>
        </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Product not found.</div>;
  }

  // product.category is now an object { name: string, slug: string }
  // The name is already display-friendly.
  const categoryDisplayName = product.category.name;
  const categorySlug = product.category.slug;


  return (
    <div className="container mx-auto px-4 py-8">
      {productLdJsonScript}
      <Breadcrumbs
        category={{ name: categoryDisplayName, slug: categorySlug }} // Pass category object
        productTitle={product.title}
      />
      <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-x-8 items-start">
        <div className="lg:col-span-1">
          {/* Use new ProductGallery component and pass correct props */}
          <ProductGallery
            images={product.images}
            thumbnail={product.thumbnail}
            productTitle={product.title}
          />
        </div>
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.title}</h1>
          {product.brand && <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>}
          <PriceBox product={product} />
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Description</h3>
            <div className="prose prose-sm sm:prose-base max-w-none whitespace-pre-line text-gray-700">
              {product.description}
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.stock && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <WishlistButton product={product} />
            <CopyLinkButton />
          </div>
        </div>
      </div>
    </div>
  );
}
