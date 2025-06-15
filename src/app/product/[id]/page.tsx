// src/app/product/[id]/page.tsx
import { getProductById, getProducts } from '@/bff/services';
import { ProductSchema } from '@/bff/types';
import { z } from 'zod';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs'; // Re-using global or can be specific instance
import { notFound } from 'next/navigation';
import CopyLinkButton from '@/components/CopyLinkButton'; // Import the actual component

// Placeholder Components (to be created/refined in subsequent steps or separate files)

// Gallery Component Placeholder
const Gallery = ({ images, title }: { images?: string[]; title: string }) => {
  if (!images || images.length === 0) {
    return <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">No Image Available</div>;
  }
  // For now, just display the first image (thumbnail could also be an option)
  return (
    <div className="w-full">
      <img src={images[0]} alt={`Image 1 of ${title}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
      {/* TODO: Implement next/prev tap, zoom on click */}
      {images.length > 1 && <p className="text-sm text-center mt-2 text-gray-600">Gallery (1 of {images.length}) - Full gallery TBD</p>}
    </div>
  );
};

// PriceBox Component Placeholder
const PriceBox = ({ product }: { product: z.infer<typeof ProductSchema> }) => {
  const originalPrice = product.price.toFixed(2);
  const effectivePrice = product.effectivePrice?.amount.toFixed(2);
  const isB2B = product.effectivePrice && product.effectivePrice.amount < product.price;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <p className="text-3xl font-bold text-gray-900">
        {isB2B ? `$${effectivePrice}` : `$${originalPrice}`}
        {isB2B && <span className="text-sm text-green-600 ml-2">(Your B2B Price)</span>}
      </p>
      {isB2B && (
        <p className="text-md text-gray-500 line-through">
          List Price: ${originalPrice}
        </p>
      )}
      {product.discountPercentage && product.discountPercentage > 0 && !isB2B && (
         <p className="text-sm text-red-500">Save {product.discountPercentage.toFixed(0)}%</p>
      )}
    </div>
  );
};

// CopyLinkButton Component Placeholder (Client Component)
// This should ideally be in its own file: src/components/CopyLinkButton.tsx
// For now, defining structure here.
// const CopyLinkButtonPlaceholder = () => { // Comment out or remove placeholder
//     // Client logic for navigator.clipboard.writeText(url) + toast will be here
//     return (
//         <button className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">
//             Copy Link (TBD)
//         </button>
//     );
// };


// Needed for generateStaticParams if you want to pre-render some product pages
// Fetches a subset of products to get their IDs.
export async function generateStaticParams() {
  try {
    // Fetch a small number of products to pre-render, e.g., the first few or popular ones
    const { items: products } = await getProducts({ limit: 10 });
    return products.map((product) => ({
      id: String(product.id),
    }));
  } catch (error) {
    console.error("Failed to generate static params for product pages:", error);
    return [];
  }
}

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const productId = params.id;
  let product: z.infer<typeof ProductSchema>;

  try {
    product = await getProductById(productId);
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return notFound(); // Triggers the not-found page
  }

  if (!product) {
    return notFound();
  }

  // LD+JSON Script
  const productLdJson = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images || [product.thumbnail],
    "description": product.description,
    "sku": String(product.id), // Assuming ID can be used as SKU
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Unknown Brand"
    },
    // TODO: Add offers, reviews, aggregateRating if available
    "offers": {
      "@type": "Offer",
      "url": typeof window !== 'undefined' ? window.location.href : `https://your-domain.com/product/${product.id}`, // Placeholder URL
      "priceCurrency": product.effectivePrice?.currencyCode || "USD",
      "price": product.effectivePrice?.amount || product.price,
      // "itemCondition": "https://schema.org/NewCondition", // If applicable
      "availability": product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    }
  };

  // For breadcrumbs: "Home / CategoryName / ProductName"
  // We need the category name. Product object from dummyjson has `category` field (raw slug like 'smartphones')
  // We need to convert this slug to a display name.
  const categoryDisplayName = product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Specific Breadcrumbs instance for PDP to pass dynamic names */}
      <Breadcrumbs
        categoryName={categoryDisplayName}
        productTitle={product.title}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLdJson) }}
      />

      <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-x-8 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-1">
          <Gallery images={product.images} title={product.title} />
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.title}</h1>

          {product.brand && <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>}

          <PriceBox product={product} />

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div
              className="space-y-6 text-base text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }} // Assuming description is safe HTML or just text
            />
          </div>

          {product.stock && product.stock > 0 ? (
            <p className="mt-4 text-sm text-green-600">In Stock ({product.stock} available)</p>
          ) : (
            <p className="mt-4 text-sm text-red-600">Out of Stock</p>
          )}

          {/* Placeholder for Add to Cart and other actions */}
          <div className="mt-6">
            <button type="button" className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Add to Cart (TBD)
            </button>
            <CopyLinkButton />
          </div>

        </div>
      </div>

      {/* TODO: Related products, reviews, etc. */}
    </div>
  );
}
