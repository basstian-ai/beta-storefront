'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images?: string[]; // Optional: product.images can be undefined
  thumbnail: string; // Product always has a thumbnail
  productTitle: string; // For alt text
}

export default function ProductGallery({ images, thumbnail, productTitle }: ProductGalleryProps) {
  // Initialize mainImage with the thumbnail. If thumbnail is somehow missing, provide a fallback.
  const [mainImage, setMainImage] = useState(thumbnail || '/placeholder-image.png');

  // Effect to update mainImage if the thumbnail prop changes (e.g., on navigating to a new product page)
  useEffect(() => {
    setMainImage(thumbnail || '/placeholder-image.png');
  }, [thumbnail]);

  const allDisplayableImages = [thumbnail, ...(images || [])].filter(Boolean) as string[];
  // Remove duplicates if thumbnail is also in images array
  const uniqueImages = Array.from(new Set(allDisplayableImages));

  if (!thumbnail && (!images || images.length === 0)) {
    return (
      <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square w-full relative overflow-hidden rounded-lg border border-gray-200">
        <Image
          src={mainImage}
          alt={`Main image for ${productTitle}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Basic responsive sizes
          className="object-cover object-center"
          priority // Prioritize loading the main image
        />
      </div>

      {/* Thumbnails */}
      {uniqueImages.length > 1 && ( // Only show thumbnails if there's more than one unique image
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {uniqueImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(image)}
              className={`aspect-square w-full relative overflow-hidden rounded-md border-2 transition-all
                          ${mainImage === image ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'}
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1} for ${productTitle}`}
                fill
                sizes="10vw" // Small size for thumbnails
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
