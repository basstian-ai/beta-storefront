// src/app/auth/error/page.tsx
'use client'; // For using useSearchParams

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react'; // Optional: for logging error once on client

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Optional: Log the error to the console for developers, once on mount
  useEffect(() => {
    if (error && process.env.NODE_ENV !== 'production') {
      console.error('Auth Error Page - NextAuth Error:', error);
    }
  }, [error]);

  let errorMessage = 'An unexpected error occurred during authentication. Please try again.';
  let errorTitle = 'Authentication Error';

  if (error) {
    switch (error.toLowerCase()) {
      case 'credentialssignin':
        errorTitle = 'Login Failed';
        errorMessage = 'Invalid username or password. Please check your credentials and try again.';
        break;
      case 'sessionrequired':
        errorTitle = 'Session Required';
        errorMessage = 'You must be logged in to access this page. Please log in.';
        break;
      case 'oauthsignin':
      case 'oauthcallback':
      case 'oauthcreateaccount':
      case 'emailcreateaccount':
      case 'callback':
      case 'emailsignin':
        errorTitle = 'Authentication Service Error';
        errorMessage = `There was an issue with the authentication provider (${error}). Please try again later or contact support.`;
        break;
      case 'configuration':
         errorTitle = 'Server Configuration Error';
         errorMessage = 'There is a configuration issue with the authentication server. Please contact support.';
         break;
      // Add other common NextAuth error types from documentation if needed
      // https://next-auth.js.org/configuration/pages#error-page
      default:
        errorTitle = 'Authentication Error';
        errorMessage = `An unknown authentication error occurred. Code: ${error}`;
        break;
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white p-8 sm:p-12 border border-gray-200 rounded-xl shadow-lg text-center max-w-lg w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-6">{errorTitle}</h1>
        <p className="text-gray-700 text-base sm:text-lg mb-8">{errorMessage}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Try Logging In Again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
