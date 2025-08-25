import Link from 'next/link';
import { notFound } from 'next/navigation';
import stores from '@/fixtures/mockStoreStock.json';

interface Params {
  params: { id: string };
}

export const metadata = {
  title: 'Store Details',
};

export default function StoreDetailsPage({ params }: Params) {
  const store = stores.find((s) => s.storeId === params.id);
  if (!store) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{store.storeName}</h1>
      <p className="mb-4 text-gray-600">{store.address}</p>
      <Link href="/stores" className="text-primary hover:text-accent">
        Back to store list
      </Link>
    </div>
  );
}
