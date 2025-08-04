// src/components/PriceBox.tsx
import { useState } from 'react';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { useCartStore } from '@/stores/useCartStore'; // Import useCartStore
import toast from 'react-hot-toast'; // Import toast
import { applyB2BPrice } from '@/utils/applyB2BPrice';

interface PriceBoxProps {
  product: z.infer<typeof ProductSchema>;
  role?: string;
}

export default function PriceBox({ product, role }: PriceBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const addItemToCart = useCartStore((state) => state.addItem); // Get addItem action

  const originalPrice = product.price.toFixed(2);
  const effectivePriceAmount = applyB2BPrice(product.price, role);
  const effectivePrice = effectivePriceAmount.toFixed(2);
  const displayPrice = effectivePrice;
  const isB2BScenario = role === 'b2b' && effectivePriceAmount < product.price;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    } else {
      setQuantity(1); // Ensure quantity doesn't go below 1
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === '') {
      // Allow empty input temporarily, could reset to 1 on blur if still empty
      // For now, let's assume the user will type a number.
      // Or, setQuantity(1) or some temporary state for empty string.
      // For this step, we'll parse and if NaN, it might default to 1 via handleQuantityChange
      setQuantity(1); // Or handle more gracefully e.g. allow empty then validate on blur
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      handleQuantityChange(num);
    }
  };

  const handleAddToCart = () => {
    addItemToCart(product, quantity);
    toast.success(`Added ${quantity} x ${product.title} to cart!`);
  };

  return (
    <div className="mt-4 p-6 border rounded-lg bg-white shadow">
      <div className="flex flex-col">
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

      {/* Quantity Selector */}
      <div className="mt-6">
        <label htmlFor={`quantity-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="px-3 py-1.5 border border-gray-300 rounded-l-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            id={`quantity-${product.id}`}
            name="quantity"
            value={quantity}
            onChange={handleInputChange}
            min="1"
            className="w-16 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Product quantity"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            // Add disabled condition if max stock is known: disabled={quantity >= product.stock}
            className="px-3 py-1.5 border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
      {role === 'b2b' && (
        <button
          type="button"
          className="mt-3 w-full border border-blue-600 text-blue-600 py-2.5 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Request Quote
        </button>
      )}
    </div>
  );
}
