// src/app/(protected)/quick-order/page.tsx
import AuthGuard from '@/components/AuthGuard';
import QuickOrderForm from './QuickOrderForm';

export default function QuickOrderPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Quick Order</h1>
        <QuickOrderForm />
      </div>
    </AuthGuard>
  );
}
