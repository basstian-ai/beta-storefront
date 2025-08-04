// src/app/(protected)/quote/confirmation/page.tsx
import AuthGuard from '@/components/AuthGuard';
import QuoteSummary from './QuoteSummary';

interface PageProps {
  searchParams: {
    id?: string;
  };
}

export default function QuoteConfirmationPage({ searchParams }: PageProps) {
  const quoteId = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  return (
    <AuthGuard>
      <QuoteSummary quoteId={quoteId} />
    </AuthGuard>
  );
}

