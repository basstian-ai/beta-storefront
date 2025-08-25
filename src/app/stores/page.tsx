import Link from 'next/link';
import stores from '@/fixtures/mockStoreStock.json';

export const metadata = {
  title: 'Find a Store',
};

export default function StoresPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Find a store</h1>
      <ul className="space-y-4">
        {stores.map((store) => (
          <li key={store.storeId} className="border-b pb-4">
            <Link href={`/stores/${store.storeId}`} className="block hover:text-accent">
              <h2 className="text-xl font-semibold">{store.storeName}</h2>
              <p className="text-sm text-gray-600">{store.address}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
