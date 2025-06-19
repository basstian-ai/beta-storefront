import React from 'react';

export function highlight(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const re = new RegExp(`(${term})`, 'ig');
  return text.split(re).map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200">{part}</mark>
    ) : (
      part
    )
  );
}
