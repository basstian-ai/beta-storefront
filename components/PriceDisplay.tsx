// components/PriceDisplay.tsx
import styles from '@/styles/PriceDisplay.module.css';
import { Product } from '@/types'; // Assuming PriceTier is part of Product or a separate type

// Define a more specific type for PriceTier if available, or use a generic one
// For now, let's assume priceTiers is an array of objects with quantity and price properties.
// e.g., { quantity: number, price: number, label?: string }

// PriceTier interface will be imported from '@/types'

interface PriceDisplayProps {
  price: number;
  priceTiers: PriceTier[]; // This will use the imported PriceTier
  contractPrice?: number | null; // Can be number or null
  customerToken?: string | null; // Can be string or null
}

import { PriceTier } from '@/types'; // Import PriceTier

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, priceTiers, contractPrice, customerToken }) => {
  const showContractPrice = customerToken && typeof contractPrice === 'number';

  return (
    <div className={styles.priceContainer}>
      {showContractPrice ? (
        <div className={styles.contractPrice}>
          Your Contract Price: <span className={styles.priceValue}>${(contractPrice as number).toFixed(2)}</span>
        </div>
      ) : (
        <>
          <div className={styles.regularPrice}>
            Price: <span className={styles.priceValue}>${price.toFixed(2)}</span>
          </div>

          {priceTiers && priceTiers.length > 0 && (
            <div className={styles.priceTiers}>
              <h4 className={styles.tiersTitle}>Volume Discounts:</h4>
              <ul>
                {priceTiers.map((tier, index) => (
                  <li key={index} className={styles.tierItem}>
                    Buy {tier.quantity} for ${tier.price.toFixed(2)} {tier.label || 'each'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
