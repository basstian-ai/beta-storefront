'use client';

import React, { createContext, useContext, useState } from 'react';

interface SearchStatusContextType {
  message: string;
  setMessage: (msg: string) => void;
}

const SearchStatusContext = createContext<SearchStatusContextType | undefined>(undefined);

export function SearchStatusProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  return (
    <SearchStatusContext.Provider value={{ message, setMessage }}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </SearchStatusContext.Provider>
  );
}

export function useSearchStatus() {
  const ctx = useContext(SearchStatusContext);
  return ctx ?? { message: '', setMessage: () => {} };
}
