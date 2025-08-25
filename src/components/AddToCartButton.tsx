'use client';

import React from 'react';
import { Product } from '@/types/order';
import { useCartStore } from '@/stores/useCartStore';
import toast from 'react-hot-toast';
import { commerceAdapter } from '@/adapters/commerce';

interface AddToCartButtonProps {
  products: Product[];
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ products }) => {
  const { addItem, setFulfillment } = useCartStore();

  const handleAddToCart = async () => {
    setFulfillment({ type: 'delivery' });
    let success = true;
    for (const orderProduct of products) {
      try {
        const fullProduct = await commerceAdapter.fetchProductById(orderProduct.id);
        if (fullProduct) {
          addItem(fullProduct, orderProduct.quantity);
        } else {
          success = false;
          console.error(`Failed to fetch product details for product ID: ${orderProduct.id}`);
        }
      } catch (error) {
        success = false;
        console.error(`Error fetching product details for product ID: ${orderProduct.id}`, error);
      }
    }

    if (success) {
      toast.success('All products added to cart!');
    } else {
      toast.error('Some products could not be added to the cart.');
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Add all to cart
    </button>
  );
};

export default AddToCartButton;
