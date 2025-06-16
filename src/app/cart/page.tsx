// src/app/cart/page.tsx
'use client'; // This page needs client-side interactivity for cart management

import AuthGuard from '@/components/AuthGuard';
import { useCartStore, CartItem } from '@/stores/useCartStore'; // Import store and CartItem type
import Link from 'next/link';
import Image from 'next/image'; // For better image handling
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CartPage() {
  // Subscribe to cart store state and actions
  const items = useCartStore((state) => state.items);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const clearCart = useCartStore((state) => state.clearCart); // For "Clear Cart" button

  const subtotal = getCartSubtotal();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return; // Prevent negative quantities
    updateItemQuantity(productId, newQuantity);
    if (newQuantity === 0) {
        toast.success('Item removed from cart');
    } else {
        toast.success('Cart updated');
    }
  };

  const handleRemoveItem = (productId: number, productName: string) => {
    removeItem(productId);
    toast.error(`${productName} removed from cart`);
  };

  const handleRequestQuote = () => {
    // Stub handler for now
    toast.info('"Request Quote" feature coming soon!');
    // In a real app, this might clear the cart and redirect to a quote form or confirmation page.
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-700 mb-4">Your cart is currently empty.</p>
            <Link href="/" className="text-lg text-blue-600 hover:text-blue-800 font-medium">
              Continue Shopping &rarr;
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
            {/* Cart Items List */}
            <section aria-labelledby="cart-heading" className="lg:col-span-7 bg-white p-6 shadow-lg rounded-lg">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <ul role="list" className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.product.id} className="flex py-6">
                    <div className="flex-shrink-0">
                      <Image
                        src={item.product.thumbnail || '/placeholder-image.png'} // Fallback image
                        alt={item.product.title}
                        width={96} // 6rem
                        height={96} // 6rem
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-800">
                              <Link href={`/product/${item.product.slug || item.product.id}`} className="hover:text-blue-600">
                                {item.product.title}
                              </Link>
                            </h3>
                          </div>
                          {item.product.brand && <p className="mt-1 text-sm text-gray-500">{item.product.brand}</p>}
                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            ${(item.product.effectivePrice?.amount ?? item.product.price).toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-gray-300 rounded-md w-fit">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-l-md focus:outline-none disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="h-5 w-5" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value, 10);
                                handleQuantityChange(item.product.id, isNaN(newQuantity) || newQuantity < 1 ? 1 : newQuantity);
                              }}
                              className="w-12 border-0 border-l border-r border-gray-300 text-center text-sm font-medium text-gray-700 focus:ring-0 focus:border-gray-300"
                              aria-label={`Quantity for ${item.product.title}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-r-md focus:outline-none"
                            >
                              <PlusIcon className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="absolute top-0 right-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500"
                            >
                              <span className="sr-only">Remove</span>
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                       {/* B2B price indication if applicable */}
                        {item.product.effectivePrice && item.product.effectivePrice.amount < item.product.price && (
                            <p className="mt-1 text-xs text-green-600">B2B price applied</p>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order Summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow-lg"
            >
              <h2 id="summary-heading" className="text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                {/* Add other summary lines like Shipping, Taxes if needed */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">Order total</dt>
                  <dd className="text-base font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                >
                  Request Quote (Stub)
                </button>
              </div>
              <div className="mt-4">
                 <button
                    type="button"
                    onClick={() => { clearCart(); toast.info("Cart cleared!"); }}
                    className="w-full text-sm text-red-600 hover:text-red-800 text-center"
                >
                    Clear Cart
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
