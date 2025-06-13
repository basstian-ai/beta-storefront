// components/ImageGallery.tsx
import { useState } from 'react';
import Image from 'next/image'; // Using next/image for optimization
import styles from '@/styles/ImageGallery.module.css';

interface ImageGalleryProps {
  images: string[];
  productName: string; // For alt text
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || '/placeholder.png'); // Default to first image or a placeholder

  if (!images || images.length === 0) {
    // Fallback for product with no images, though Product type mandates images
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImageContainer}>
          <Image src="/placeholder.png" alt="No image available" width={500} height={500} objectFit="contain" />
          <div className={styles.zoomPlaceholder}>Zoom (placeholder)</div>
        </div>
      </div>
    );
  }

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageContainer}>
        <Image
          src={selectedImage}
          alt={`${productName} - Main view`}
          width={500}
          height={500}
          objectFit="contain" // Adjust as needed, e.g., "cover"
          className={styles.mainImage}
        />
        <div className={styles.zoomPlaceholder} title="Zoom functionality coming soon!">
          🔍 Zoom (Hover/Click - Placeholder)
        </div>
      </div>
      <div className={styles.thumbnailList}>
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`${styles.thumbnail} ${selectedImage === imageUrl ? styles.selectedThumbnail : ''}`}
            onClick={() => handleThumbnailClick(imageUrl)}
          >
            <Image
              src={imageUrl}
              alt={`${productName} - Thumbnail ${index + 1}`}
              width={80}
              height={80}
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
