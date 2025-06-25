// src/app/account/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchUserCarts } from '@/lib/fetchUserCarts';
import OrderHistory from '@/components/OrderHistory';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/account');
  }
  const user = session.user!;
  const carts = await fetchUserCarts(user.id as string | number);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <Image
          src={user.image || '/placeholder-image.webp'}
          alt="User avatar"
          width={64}
          height={64}
          className="rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Link href="#" className="text-sm text-blue-600 hover:underline">Edit profile</Link>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Order History</h3>
        <OrderHistory carts={carts} />
      </div>
    </div>
  );
}
