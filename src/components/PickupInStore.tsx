import { useState } from 'react';

interface StoreAvailability {
  storeId: string;
  storeName: string;
  address: string;
  stock: number;
}

interface Props {
  productId: number | string;
}

export default function PickupInStore({ productId }: Props) {
  const [stores, setStores] = useState<StoreAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/${productId}`);
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
              <li key={store.storeId} className="p-4 flex justify-between">
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
