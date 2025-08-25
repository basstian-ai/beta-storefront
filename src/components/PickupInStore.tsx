import { useState } from 'react';
import { z } from 'zod';
import { ProductSchema } from '@/bff/types';
import { useCartStore } from '@/stores/useCartStore';
import toast from 'react-hot-toast';

interface StoreAvailability {
  storeId: string;
  storeName: string;
  address: string;
  stock: number;
}

interface Props {
  product: z.infer<typeof ProductSchema>;
}

export default function PickupInStore({ product }: Props) {
  const [stores, setStores] = useState<StoreAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem, setFulfillment } = useCartStore();

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${product.id}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = (await res.json()) as StoreAvailability[];
      setStores(data);
      setError(null);
    } catch {
      setError('Unable to load store availability');
      setStores(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Pick up in store</h3>
      {stores ? (
        <>
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {stores.map((store) => (
              <li key={store.storeId} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{store.storeName}</p>
                    <p className="text-sm text-gray-500">{store.address}</p>
                  </div>
                  <span
                    className={
                      store.stock > 0
                        ? 'text-sm font-medium text-green-600'
                        : 'text-sm font-medium text-red-600'
                    }
                  >
                    {store.stock > 0 ? `${store.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                {store.stock > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!setFulfillment({ type: 'pickup', store })) {
                        toast.error('Cart has items for delivery or another store');
                        return;
                      }
                      addItem(product, 1);
                      toast.success(`Added for pickup at ${store.storeName}`);
                    }}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    Pick up here
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setStores(null)}
            className="mt-4 w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </>
      ) : (
        <>
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <button
            type="button"
            onClick={fetchAvailability}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Checking availability...' : 'Check availability in store'}
          </button>
        </>
      )}
    </div>
  );
}
