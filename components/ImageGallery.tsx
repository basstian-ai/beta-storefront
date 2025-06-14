import React, { useState, useEffect } from 'react';
import styles from './ImageGallery.module.css';

export interface Image {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  images: Image[];
  defaultMainImageAlt?: string; // Optional alt for a default main image if no images are passed
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, defaultMainImageAlt = "Product image" }) => {
  const [mainImage, setMainImage] = useState<Image | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setMainImage(images[0]);
    } else {
      setMainImage(null); // Handle case with no images
    }
  }, [images]);

  if (!images || images.length === 0) {
    return <div className={styles.imageGalleryContainer}><p>No images to display.</p></div>;
  }

  const handleThumbnailClick = (image: Image) => {
    setMainImage(image);
  };

  return (
    <div className={styles.imageGalleryContainer} data-testid="image-gallery-container">
      <div className={styles.mainImageContainer}>
        {mainImage && (
          <img
            key={mainImage.src} // Add key to ensure re-render on src change for effects
            src={mainImage.src}
            alt={mainImage.alt}
            className={styles.mainImage}
            data-testid="main-image"
          />
        )}
        {!mainImage && defaultMainImageAlt && (
             <div className={styles.mainImagePlaceholder} data-testid="main-image-placeholder">{defaultMainImageAlt}</div>
        )}
      </div>
      {images.length > 1 && ( // Only show thumbnails if there's more than one image
        <div className={styles.thumbnailContainer} data-testid="thumbnail-container">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className={`${styles.thumbnailImage} ${mainImage?.src === image.src ? styles.activeThumbnail : ''}`}
              onClick={() => handleThumbnailClick(image)}
              data-testid={`thumbnail-image-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
