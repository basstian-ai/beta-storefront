// src/components/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateBreadcrumbs, BreadcrumbSegment } from '@/lib/generateBreadcrumbs';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

export interface BreadcrumbsProps {
  productTitle?: string;
  category?: { name: string; slug: string };
}

export default function Breadcrumbs({ productTitle, category }: BreadcrumbsProps) {
  const pathname = usePathname();
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);

  useEffect(() => {
    const dynamicData = { productTitle, category };
    const generatedSegments = generateBreadcrumbs(pathname, dynamicData);
    setSegments(generatedSegments);
  }, [pathname, productTitle, category]);

  if (segments.length <= 1 && pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-white px-4 py-3 sm:px-6 lg:px-8 border-b border-gray-200">
      <ol role="list" className="flex items-center space-x-2 text-sm">
        <li>
          <div>
            <Link href="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {segments.slice(1).map((segment, index) => (
          <li key={segment.name + '-' + index}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <Link
                href={segment.href}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={index === segments.length - 2 ? 'page' : undefined}
              >
                {segment.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
