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
import { useWishlistStore } from '@/stores/useWishlistStore';
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
    { name: 'Find Store', href: '/stores', current: pathname === '/stores' },
    ...allCategoryItems,
  ];

  const visibleItems = navigation.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenItems = navigation.slice(MAX_VISIBLE_CATEGORIES);

  return (
<Disclosure as="nav" className="bg-secondary shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo and Desktop Navigation Links */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="https://framerusercontent.com/images/H8v52JdMhMaxYB8SqOgDMWLqwI.svg"
                      alt="Forte Digital Logo"
                      width={100}
                      height={40}
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'text-accent' : 'text-primary hover:text-accent',
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
                          <Menu.Button className="text-primary hover:text-accent rounded-md px-3 py-2 text-sm font-medium">
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
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-secondary py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {hiddenItems.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    href={item.href}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      item.current ? 'text-accent' : 'text-primary',
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="hidden sm:block w-64">
                  <SearchBar />
                </div>

                {/* Icons Group */}
                <div className="flex items-center space-x-2 sm:space-x-4 ml-auto sm:ml-4">
                  <Link href="/cart" className="relative rounded-full bg-secondary p-1 text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary" title="View Cart">
                    <span className="sr-only">View Cart</span>
                    <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                    {hasMounted && totalCartItems > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-secondary">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                  <Link href="/wishlist" className="relative rounded-full bg-secondary p-1 text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary" title="View Wishlist">
                    <span className="sr-only">View Wishlist</span>
                    <Heart className="h-6 w-6" aria-hidden="true" />
                    {hasMounted && wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-secondary">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Auth Section: Avatar Dropdown or Login Icon */}
                  {status === 'loading' ? (
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-100"></div>
                  ) : session ? (
                    <Menu as="div" className="relative">
                      <div>
                        <Menu.Button className="flex rounded-full bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary">
                          <span className="sr-only">Open user menu</span>
                          {session.user?.image ? (
                            <Image
                              className="h-6 w-6 rounded-full"
                              src={session.user.image}
                              alt="User avatar"
                              width={24}
                              height={24}
                              sizes="24px"
                              placeholder="blur"
                              blurDataURL="/img/placeholder.svg"
                            />
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                              <span className="text-xs font-medium leading-none text-primary">
                                {session.user?.name?.substring(0, 2).toUpperCase() || <UserCircleIcon className="h-5 w-5 text-primary" />}
                              </span>
                            </span>
                          )}
                        </Menu.Button>
                      </div>
                      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-secondary py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (<Link href="/account" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-primary')}>My Account</Link>)}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (<button onClick={() => signOut({ callbackUrl: '/' })} className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-primary')}>Sign out</button>)}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <Link
                      href="/login"
                      className="rounded-full bg-secondary p-1 text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-secondary"
                      aria-label="Login / My Account"
                    >
                      <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-3 px-2 pb-3 pt-2">
              <SearchBar />
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-100 text-accent' : 'text-primary hover:bg-gray-100 hover:text-accent',
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
