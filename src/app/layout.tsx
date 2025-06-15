// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCategories } from '@/bff/services';
import { unstable_noStore as noStore } from 'next/cache';
import { Toaster } from 'react-hot-toast'; // Import Toaster

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beta Storefront',
  description: 'A composable Next.js 14 storefront.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();
  let categoriesForNav: { name: string; slug: string }[] = [];
  let categoryError: string | null = null;

  try {
    const fetchedCategories: string[] = await getCategories();
    categoriesForNav = fetchedCategories.map((catName) => ({
      name: catName.charAt(0).toUpperCase() + catName.slice(1),
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
    }));
  } catch (err) {
    console.error('Failed to fetch categories for layout:', err);
    categoryError = 'Could not load categories.';
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster provider */}
        <NavBar initialCategories={categoriesForNav} categoryError={categoryError} />
        <Breadcrumbs />
        <main className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
