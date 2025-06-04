import styles from '../styles/HeroBanner.module.css'; // Import the CSS module

type HeroBannerProps = {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  // Optional alt text prop for better accessibility
  imageAlt?: string;
};

export default function HeroBanner({ title, description, ctaText, ctaLink, imageUrl, imageAlt = "Hero image" }: HeroBannerProps) {
  return (
    <section className={styles.heroBanner}> {/* Use CSS module class */}
      <div className={styles.textContent}> {/* Use CSS module class */}
        <h1>{title}</h1>
        <p>{description}</p>
        <a href={ctaLink} className={styles.ctaButton}>{ctaText}</a> {/* Use CSS module class */}
      </div>
      <div className={styles.imageContent}> {/* Use CSS module class */}
        <img src={imageUrl} alt={imageAlt} />
      </div>
    </section>
  );
}
