// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCategories } from '@/bff/services';
// import { unstable_noStore as noStore } from 'next/cache'; // Remove if using revalidate
import { Toaster } from 'react-hot-toast'; // Import Toaster
import AuthSessionProvider from '@/components/AuthSessionProvider'; // Import

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
  // noStore(); // Remove this if using revalidate, as they serve different caching strategies.
                  // revalidate will cache for a period, noStore prevents caching altogether.
  let categoriesForNav: { name: string; slug: string }[] = [];
  let categoryError: string | null = null;

  try {
    // Call getCategories with revalidation option
    const fetchedCategories: string[] = await getCategories({ next: { revalidate: 3600 } }); // Cache for 1 hour

    categoriesForNav = fetchedCategories.map((catName) => ({
      name: catName.charAt(0).toUpperCase() + catName.slice(1).replace(/-/g, ' '), // Improved display name for slugs
      slug: catName.toLowerCase().replace(/\s+/g, '-'), // Standard slugify
    }));
  } catch (err) {
    // console.error already happens in adapter if fetch fails.
    // This catch is for other potential errors or if adapter doesn't throw structured error.
    console.error('RootLayout: Error fetching categories for NavBar:', err instanceof Error ? err.message : String(err));
    categoryError = 'Could not load categories.';
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider> {/* Wrap with SessionProvider */}
          <Toaster position="top-center" reverseOrder={false} />
          <NavBar initialCategories={categoriesForNav} categoryError={categoryError} />
          <Breadcrumbs />
          <main className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
