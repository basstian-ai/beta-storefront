'use client';
import { SearchStatusProvider } from '@/context/SearchStatusContext';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <SearchStatusProvider>{children}</SearchStatusProvider>;
}
