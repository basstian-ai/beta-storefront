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
};

export type { CartItem, CheckoutSession } from './order';
export type { Quote } from './quote';
export type { HistoryRecord } from './history';
