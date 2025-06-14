import type { Product, Variant } from '@/types';

// Helper to get a description. Falls back to name if no dedicated description field.
const getDescription = (product: Product, variant?: Variant | null): string => {
  // Assuming no dedicated description field in our types for now.
  // In a real app, you might have product.description or variant.description.
  if (variant?.name) {
    return `${product.name} - ${variant.name}`;
  }
  return product.name;
};

// Helper to determine the image for JSON-LD
const getImage = (product: Product, variant?: Variant | null): string => {
  if (variant?.imageUrl) {
    return variant.imageUrl;
  }
  if (product.images && product.images.length > 0 && product.images[0].src) {
    return product.images[0].src; // Use first image from product.images array
  }
  return product.imageUrl; // Fallback to main product imageUrl
};

interface GenerateProductJsonLdOptions {
  product: Product;
  selectedVariant?: Variant | null;
  displayPrice: number; // The actual price to be displayed (could be contract or regular)
  currency?: string;
  brandName?: string;
}

export const generateProductJsonLd = ({
  product,
  selectedVariant,
  displayPrice,
  currency = 'USD', // Default currency
  brandName = 'OurBrand', // Default brand name
}: GenerateProductJsonLdOptions): object => {
  const name = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;
  const sku = selectedVariant?.sku || product.id; // Use product.id as a fallback SKU
  const image = getImage(product, selectedVariant);
  const description = getDescription(product, selectedVariant);

  // Construct the JSON-LD object
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: name,
    image: image ? [image] : undefined, // Image should be an array or a single URL.
    description: description,
    sku: sku,
    mpn: sku, // Manufacturer Part Number, can often be the same as SKU
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price: displayPrice.toFixed(2),
      availability: 'https://schema.org/InStock', // Assuming InStock for now
      url: typeof window !== 'undefined' ? window.location.href : undefined, // URL of the product page
      // itemCondition: 'https://schema.org/NewCondition', // If applicable
      // priceValidUntil: "YYYY-MM-DD" // If applicable
    },
    // Potentially add more fields like reviews, aggregateRating, etc.
  };

  // Clean up undefined fields to avoid them in the output
  if (!jsonLd.image) delete jsonLd.image;
  if (!jsonLd.offers.url) delete jsonLd.offers.url;


  return jsonLd;
};
