// src/app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm'; // Import the new component

// Fallback component for Suspense (optional, can be null or more complex)
const LoginFormLoading = () => (
  <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in to your account
      </h2>
    </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <p className="text-center">Loading form...</p>
    </div>
  </div>
);

export default function LoginPage() {
  // This page component itself no longer uses useSearchParams directly.
  // It delegates to LoginForm which is a client component.
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      {/* The Suspense boundary wraps the component that uses useSearchParams */}
      <Suspense fallback={<LoginFormLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
