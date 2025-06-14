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
  images?: Array<{ src: string; alt: string }>;
  specifications?: Array<{ name: string; value: string }>;
  priceTiers?: Array<{ quantity: number; price: number }>;
  contractPrice?: number;
  variants?: Variant[];
};

export interface Variant {
  id: string;
  name: string; // e.g., "Red, XL"
  sku: string;
  attributes: Record<string, string>; // e.g., { "color": "Red", "size": "XL" }
  imageUrl?: string; // Optional: if variants can have unique images
  // Future consideration: price?: number; stock?: number;
}
