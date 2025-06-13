export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string; // Added this line
}

// Add HeroContent interface
export interface HeroContent {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imageAlt?: string; // Keep optional as it has a default in the component
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  createdAt: string;
  images: string[];
  description: string; // Added product description
  specifications: Record<string, any> | Array<Record<string, any>>;
  priceTiers: Array<Record<string, any>>;
  contractPrice?: number;
  variants?: ProductVariant[]; // Optional array of variants
};

export type ProductVariant = {
  id: string; // e.g., SKU or a unique variant identifier
  name: string; // e.g., "Red, Large"
  description?: string; // Variant-specific description
  images?: string[]; // Variant-specific images
  price?: number; // Variant-specific price
  specifications?: Record<string, any> | Array<Record<string, any>>; // Variant-specific specifications
  // Add other variant-specific fields as needed, e.g., stock levels
};

export interface ProductApiResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
  // Add any other fields that dummyjson.com/products might return at the top level
}
