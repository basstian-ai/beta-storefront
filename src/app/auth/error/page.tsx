// src/app/auth/error/page.tsx
import { Suspense } from 'react';
import AuthErrorClient from './AuthErrorClient'; // Ensure this path is correct

// Basic fallback UI for Suspense
const ErrorPageLoading = () => (
  <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
    <div className="bg-white p-8 sm:p-12 border border-gray-200 rounded-xl shadow-lg text-center max-w-lg w-full">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-700 mb-6">Loading Error Information...</h1>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorPageLoading />}>
      <AuthErrorClient />
    </Suspense>
  );
}
