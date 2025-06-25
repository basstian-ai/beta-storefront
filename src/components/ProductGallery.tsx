'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react'; // Removed createRef, Added KeyboardEvent (already there)
import Image from 'next/image';

interface ProductGalleryProps {
  images?: string[]; // Optional: product.images can be undefined
  thumbnail: string; // Product always has a thumbnail
  productTitle: string; // For alt text
}

export default function ProductGallery({ images, thumbnail, productTitle }: ProductGalleryProps) {
  // Initialize mainImage with the thumbnail. If thumbnail is somehow missing, provide a fallback.
  const [mainImage, setMainImage] = useState(thumbnail || '/placeholder-image.webp');

  // Effect to update mainImage if the thumbnail prop changes (e.g., on navigating to a new product page)
  useEffect(() => {
    setMainImage(thumbnail || '/placeholder-image.webp');
  }, [thumbnail]);

  const allDisplayableImages = [thumbnail, ...(images || [])].filter(Boolean) as string[];
  const uniqueImages = Array.from(new Set(allDisplayableImages));

  // Refs for thumbnail buttons
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    // Ensure the refs array has the correct number of entries, initialized to null.
    // The actual DOM elements will be assigned by the `ref` prop on each button.
    thumbnailRefs.current = Array(uniqueImages.length).fill(null);
  }, [uniqueImages]); // Depend on uniqueImages to re-initialize if the images themselves change, not just length.

  const handleThumbnailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!uniqueImages || uniqueImages.length <= 1) return;

    const currentIndex = uniqueImages.findIndex(img => img === mainImage);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % uniqueImages.length;
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + uniqueImages.length) % uniqueImages.length;
    } else {
      return; // Not an arrow key we handle for navigation
    }

    if (nextIndex !== currentIndex) {
      setMainImage(uniqueImages[nextIndex]);
      thumbnailRefs.current[nextIndex]?.focus();
    }
  };

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
        />
      </div>

      {/* Thumbnails */}
      {uniqueImages.length > 1 && (
        <div
          className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2"
          role="listbox" // Using listbox role for a collection of interactive items
          aria-label="Product image thumbnails"
          tabIndex={0} // Make the container focusable
          onKeyDown={handleThumbnailKeyDown}
        >
          {uniqueImages.map((image, index) => (
            <button
              key={index}
              ref={el => thumbnailRefs.current[index] = el} // Assign ref
              onClick={() => setMainImage(image)}
              className={`aspect-square w-full relative overflow-hidden rounded-md border-2 transition-all
                          ${mainImage === image ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'}
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
              aria-selected={mainImage === image} // Indicate selection state
              role="option" // Role for items within a listbox
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
