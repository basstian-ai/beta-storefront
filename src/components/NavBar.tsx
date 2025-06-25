// src/components/NavBar.tsx
'use client';

import Image from 'next/image';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'; // Keep outline or solid consistently
import { Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Fragment } from 'react';
import { useCartStore } from '@/stores/useCartStore'; // Import cart store
import { useWishlistStore } from '@/store/wishlist';
import { useHasMounted } from '@/hooks/useHasMounted'; // Import useHasMounted

interface CategoryNavItem {
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

export default function NavBar({ initialCategories, categoryError }: NavBarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const hasMounted = useHasMounted(); // Use the hook

  // Get total items from cart store for the badge
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const wishlistCount = Object.keys(useWishlistStore((s) => s.items)).length;

  const MAX_VISIBLE_CATEGORIES = 5;

  const allCategoryItems = initialCategories.map((category) => ({
    name: category.name,
    href: `/category/${category.slug}`,
    current: pathname === `/category/${category.slug}`,
  }));

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    ...allCategoryItems,
  ];

  const visibleItems = navigation.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenItems = navigation.slice(MAX_VISIBLE_CATEGORIES);

  return (
    <Disclosure as="nav" className="bg-gray-800 shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button - unchanged */}
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

              {/* Logo and Desktop Navigation Links - unchanged */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-white font-bold text-xl">
                    BetaStore
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {visibleItems.map((item) => (
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
                    {hiddenItems.length > 0 && (
                      <Menu as="div" className="relative">
                        <div>
                          <Menu.Button className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                            More
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {hiddenItems.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-700', // Ensure current item in dropdown is highlighted
                                      'block px-4 py-2 text-sm'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                    {categoryError && <span className="px-3 py-2 text-sm font-medium text-red-400">{categoryError}</span>}
                  </div>
                </div>
              </div>

              {/* Right side icons and search */}
              <div className="absolute inset-y-0 right-0 flex items-center space-x-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="hidden sm:block w-64">
                  <SearchBar />
                </div>
                <Link href="/cart" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" title="View Cart">
                  <span className="sr-only">View Cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  {hasMounted && totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
                <Link href="/wishlist" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" title="View Wishlist">
                  <span className="sr-only">View Wishlist</span>
                  <Heart className="h-6 w-6" aria-hidden="true" />
                  {hasMounted && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Auth Section: Avatar Dropdown or Login Icon - unchanged */}
                {status === 'loading' ? (
                  <div className="ml-3 h-8 w-8 animate-pulse rounded-full bg-gray-700"></div>
                ) : session ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        {session.user?.image ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={session.user.image}
                            alt="User avatar"
                            width={32}
                            height={32}
                            sizes="32px"
                            placeholder="blur"
                            blurDataURL="/img/placeholder.svg"
                          />
                        ) : (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                            <span className="text-sm font-medium leading-none text-white">
                              {session.user?.name?.substring(0, 2).toUpperCase() || <UserCircleIcon className="h-6 w-6 text-gray-400" />}
                            </span>
                          </span>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (<Link href="/account" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>My Account</Link>)}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (<button onClick={() => signOut({ callbackUrl: '/' })} className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}>Sign out</button>)}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link href="/login" passHref>
                    <button type="button" className="ml-3 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" title="Login / My Account">
                      <span className="sr-only">Login / My Account</span>
                      <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel - unchanged, but ensure error display is present if needed */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-3 px-2 pb-3 pt-2">
              <SearchBar />
              {/* Ensure mobile navigation also uses the full list or has its own logic if different */}
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
              {/* Ensured categoryError display is in mobile panel too */}
              {categoryError && <div className="px-3 py-2 text-base font-medium text-red-400">{categoryError}</div>}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
