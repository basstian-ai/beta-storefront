'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { mergeQueryString } from '@/utils/mergeQuery';

interface Props {
  total: number;
  page: number;
  perPage: number;
}

export default function SearchPager({ total, page, perPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / perPage);
  const current = page;

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const query = mergeQueryString(searchParams.toString(), {
      page: String(p),
      perPage: String(perPage),
    });
    router.push(`/search?${query}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-6 flex justify-center">
      <ul className="inline-flex items-center gap-2">
        <li>
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
        </li>
        {pages.map(page => (
          <li key={page}>
            <button
              onClick={() => goTo(page)}
              className={`px-3 py-1 border rounded ${page === current ? 'bg-blue-600 text-white' : ''}`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
