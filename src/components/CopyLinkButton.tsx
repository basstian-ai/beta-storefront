// src/components/CopyLinkButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client where window is defined
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      // Show "Copied!" message for a short duration
      setTimeout(() => setCopied(false), 2000);
      // TODO: Implement a more robust toast notification system
      alert('Link copied to clipboard!'); // Simple alert for now
    } catch (err) {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-4 w-full flex items-center justify-center gap-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
    >
      {copied ? (
        <>
          <CheckIcon className="h-5 w-5 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <DocumentDuplicateIcon className="h-5 w-5" />
          Copy Link
        </>
      )}
    </button>
  );
}
