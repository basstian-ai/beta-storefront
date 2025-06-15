// src/components/NavBar.tsx
'use client'; // Still a client component for Headless UI Disclosure and usePathname

import { Disclosure } from '@headlessui/react';
// Corrected import for UserCircleIcon and ShoppingCartIcon to be from outline as per new code
import { Bars3Icon, XMarkIcon, UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Removed useEffect, useState, getCategories import

interface CategoryNavItem { // Renamed from Category to avoid conflict if any
  name: string;
  slug: string;
}

interface NavBarProps {
  initialCategories: CategoryNavItem[];
  categoryError: string | null;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NavBar({ initialCategories, categoryError }: NavBarProps) { // Step 1: Accept props
  const pathname = usePathname();

  // Step 2: Use props directly
  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    ...initialCategories.map((category) => ({
      name: category.name,
      href: `/category/${category.slug}`,
      current: pathname === `/category/${category.slug}`,
    })),
  ];

  return (
    <Disclosure as="nav" className="bg-gray-800 shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-white font-bold text-xl">
                    BetaStore
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {/* Display error if category fetching failed */}
                    {categoryError && <span className="px-3 py-2 text-sm font-medium text-red-400">{categoryError}</span>}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Cart Icon is now a Link */}
                <Link
                  href="/cart"
                  className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  title="View Cart"
                >
                  <span className="sr-only">View Cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  {/* Cart badge will go here */}
                </Link>

                <Link href="/login" passHref>
                  <button
                    type="button"
                    className="ml-3 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    title="Login / My Account"
                  >
                    <span className="sr-only">Login / My Account</span>
                    <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {categoryError && <div className="px-3 py-2 text-base font-medium text-red-400">{categoryError}</div>}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
