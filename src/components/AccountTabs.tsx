import Link from 'next/link';

interface AccountTabsProps {
  active: 'orders' | 'quotes';
}

export default function AccountTabs({ active }: AccountTabsProps) {
  const tabClass = (tab: 'orders' | 'quotes') =>
    `px-4 py-2 border-b-2 ${active === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`;

  return (
    <nav className="mb-6 flex space-x-4">
      <Link href="/account" className={tabClass('orders')}>
        Orders
      </Link>
      <Link href="/account/quotes" className={tabClass('quotes')}>
        Quotes
      </Link>
    </nav>
  );
}
