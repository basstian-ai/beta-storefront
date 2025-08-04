import Link from 'next/link';

export interface OrderLike {
  id: string | number;
  createdAt?: string;
  status?: string;
}

interface OrderTableProps {
  items: OrderLike[];
  basePath: string;
  emptyMessage?: string;
  idLabel?: string;
}

export default function OrderTable({
  items,
  basePath,
  emptyMessage = 'No records found.',
  idLabel = 'ID',
}: OrderTableProps) {
  if (!items || items.length === 0) {
    return <p className="text-gray-700">{emptyMessage}</p>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">{idLabel}</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-2">
              <Link
                href={`${basePath}/${item.id}`}
                className="text-blue-600 hover:underline"
              >
                {item.id}
              </Link>
            </td>
            <td className="px-4 py-2">{item.status ?? 'N/A'}</td>
            <td className="px-4 py-2">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
