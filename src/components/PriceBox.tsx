// src/components/PriceBox.tsx
import { z } from 'zod';
import { ProductSchema } from '@/bff/types'; // Adjust path if necessary

interface PriceBoxProps {
  product: z.infer<typeof ProductSchema>;
}

export default function PriceBox({ product }: PriceBoxProps) {
  const originalPrice = product.price.toFixed(2);
  // effectivePrice is the B2B price if applicable. It might be undefined if not a B2B user or no B2B price set.
  const effectivePrice = product.effectivePrice?.amount?.toFixed(2);

  // displayPrice is what the user pays: B2B price if available, otherwise original list price.
  const displayPrice = effectivePrice || originalPrice;

  // isB2BScenario is true if an effectivePrice (B2B price) is present AND it's less than the original list price.
  const isB2BScenario = product.effectivePrice && product.effectivePrice.amount < product.price;

  return (
    <div className="mt-4 p-6 border rounded-lg bg-white shadow"> {/* Changed bg to white, increased padding */}
      <div className="flex flex-col"> {/* Main price and badges/savings stacked */}
        <div className="flex items-baseline gap-x-2">
          <p className="text-3xl font-bold text-gray-900">
            ${displayPrice}
          </p>
          {isB2BScenario && (
            <p className="text-lg text-gray-500 line-through">
              ${originalPrice}
            </p>
          )}
        </div>

        {isB2BScenario && (
          <span className="mt-1 text-sm font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-md self-start"> {/* Adjusted color, padding, margin */}
            Your B2B Price
          </span>
        )}
      </div>

      {/* General discount display if not a B2B scenario but discountPercentage exists */}
      {product.discountPercentage && product.discountPercentage > 0 && !isB2BScenario && (
         <div className="mt-2">
           <p className="text-md text-red-600 font-semibold">
             Save {product.discountPercentage.toFixed(0)}%
           </p>
           <p className="text-sm text-gray-500 line-through">
             Original: ${originalPrice}
           </p>
         </div>
      )}

      {/* Display stock information */}
      {product.stock !== undefined && (
        <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
        </p>
      )}
    </div>
  );
}
