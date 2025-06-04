export interface Category {
  id: string;
  name: string;
  slug: string;
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
