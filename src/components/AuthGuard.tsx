// src/components/AuthGuard.tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation'; // Using next/navigation for App Router
import React, { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (status === 'unauthenticated') {
      // Store the intended path in a query parameter for callback
      const callbackUrl = encodeURIComponent(pathname);
      redirect(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, pathname]);

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // Optional: Return a loading spinner or null while checking session status
  // For now, this will mean children are not rendered until authenticated.
  // A better UX might involve a global loading state or a loading component here.
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading session...</p> {/* Or a spinner component */}
    </div>
  );
}
