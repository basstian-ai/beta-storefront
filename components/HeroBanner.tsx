import styles from '../styles/HeroBanner.module.css';
import type { HeroContent } from '../types'; // Adjust path if necessary

// Use HeroContent as the props type
export default function HeroBanner({ title, description, ctaText, ctaLink, imageUrl, imageAlt = "Hero image" }: HeroContent) {
  return (
    <section className={styles.heroBanner}>
      <div className={styles.textContent}>
        <h1>{title}</h1>
        <p>{description}</p>
        <a href={ctaLink} className={styles.ctaButton}>{ctaText}</a>
      </div>
      <div className={styles.imageContent}>
        {/*
          TODO: Consider using Next.js <Image> component for automatic image optimization
          once real image sources from a CMS are integrated.
          This will help improve performance and Lighthouse scores.
          Example: <Image src={imageUrl} alt={imageAlt} width={600} height={400} layout="responsive" />
          (adjust width, height, and layout props as needed)
        */}
        <img src={imageUrl} alt={imageAlt} />
      </div>
    </section>
  );
}
