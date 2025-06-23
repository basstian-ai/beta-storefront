import { Suspense } from 'react';
import OrderSuccessClient from './success-client';

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessClient />
    </Suspense>
  );
}
