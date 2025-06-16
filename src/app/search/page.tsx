// src/app/search/page.tsx
// This file is the entry point and uses Suspense

import { Suspense } from 'react';
import SearchClientContent from '@/components/SearchClientContent'; // Import the new client component

// Define a simple loading fallback component
function SearchLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <h1 className="text-3xl font-bold mb-6 text-center h-10 bg-gray-300 rounded w-1/2 mx-auto"></h1>
      <div className="max-w-xl mx-auto mb-8">
        <div className="h-12 bg-gray-300 rounded-lg"></div> {/* Placeholder for Combobox */}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4 h-8 bg-gray-300 rounded w-1/3"></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-1 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  // This component is now very simple, just setting up Suspense.
  // The actual search logic is in SearchClientContent.
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchClientContent />
    </Suspense>
  );
}
