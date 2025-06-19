// src/components/LoginForm.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Reading searchParams here
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true); // Set loading true

    try { // Add try block
      const result = await signIn('credentials', {
        redirect: false, // Important: redirect:false allows us to handle result here
        username,
        password,
        rememberMe: rememberMe,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid username or password. Please try again.");
        } else if (result.error) {
          setError(`Login failed: ${result.error}`);
        } else { // Should not happen if result.error is set, but as a fallback
          setError("Login failed due to an unknown error.");
        }
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        // Handle cases where result is null/undefined or ok is false without specific error
        setError("Login attempt was not successful. Please try again.");
      }
    } catch (e) { // Catch any unexpected errors during signIn call itself
      console.error("LoginForm handleSubmit unexpected error:", e);
      setError("An unexpected error occurred during login.");
    } finally { // Add finally block
      setIsLoading(false); // Set loading false
    }
  };

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
            Username
          </label>
          <div className="mt-2">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading} // Disable button when loading
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50" // Added disabled:opacity-50
          >
            {isLoading ? 'Signing in...' : 'Sign in'} {/* Change text when loading */}
          </button>
        </div>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Test user: emilys / emilyspass
      </p>
    </div>
  );
}
