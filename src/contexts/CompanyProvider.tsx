'use client';

import { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

export interface CompanyContextValue {
  companyId: string;
  role: string;
  isBuyer: boolean;
  isApprover: boolean;
  isAdmin: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const companyId = session?.companyId || session?.user?.companyId;
  const role = session?.role || session?.user?.role;

  const value = companyId && role
    ? {
        companyId,
        role,
        isBuyer: role === 'buyer',
        isApprover: role === 'approver',
        isAdmin: role === 'admin',
      }
    : null;

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}

