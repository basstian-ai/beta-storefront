// components/ProductSpecifications.tsx
import styles from '@/styles/ProductSpecifications.module.css';

interface Specification {
  name: string;
  value: string | number;
}

interface ProductSpecificationsProps {
  specifications: Record<string, any> | Specification[];
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ specifications }) => {
  if (!specifications || (Array.isArray(specifications) && specifications.length === 0) || Object.keys(specifications).length === 0) {
    return <p>No specifications available for this product.</p>;
  }

  return (
    <div className={styles.specificationsContainer}>
      <h3 className={styles.title}>Product Specifications</h3>
      {Array.isArray(specifications) ? (
        <ul className={styles.list}>
          {specifications.map((spec, index) => (
            <li key={index} className={styles.listItem}>
              <span className={styles.specName}>{spec.name}:</span>{' '}
              <span className={styles.specValue}>{spec.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {Object.entries(specifications).map(([key, value], index) => (
            <li key={index} className={styles.listItem}>
              <span className={styles.specName}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>{' '}
              <span className={styles.specValue}>{String(value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductSpecifications;
