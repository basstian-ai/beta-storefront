// src/app/layout.tsx
import './globals.css'; // Make sure this line is present
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import Breadcrumbs from '@/components/Breadcrumbs'; // Import Breadcrumbs

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beta Storefront',
  description: 'A composable Next.js 14 storefront.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <Breadcrumbs /> {/* Add Breadcrumbs here */}
        <main className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
