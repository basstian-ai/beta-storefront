// src/components/CopyLinkButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'; // Import toast

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!'); // Use toast.success
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
      toast.error('Failed to copy link.'); // Use toast.error
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
