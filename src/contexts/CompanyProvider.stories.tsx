'use client';
import { SessionProvider } from 'next-auth/react';
import type { Meta, StoryObj } from '@storybook/react';
import { CompanyProvider, useCompany } from './CompanyProvider';

const RoleBadges = () => {
  const company = useCompany();
  if (!company) return <div>Unauthenticated</div>;
  return (
    <div className="flex gap-2">
      {company.isBuyer && <span className="px-2 py-1 bg-blue-200 rounded">Buyer</span>}
      {company.isApprover && <span className="px-2 py-1 bg-green-200 rounded">Approver</span>}
      {company.isAdmin && <span className="px-2 py-1 bg-red-200 rounded">Admin</span>}
    </div>
  );
};

const meta: Meta<typeof RoleBadges> = {
  title: 'Contexts/CompanyProvider',
  component: RoleBadges,
  decorators: [
    (Story, { parameters }) => (
      <SessionProvider session={parameters.session}>
        <CompanyProvider>
          <Story />
        </CompanyProvider>
      </SessionProvider>
    )
  ],
  parameters: {
    session: { user: { role: 'buyer', companyId: 'acme-inc' } }
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Buyer: Story = {
  parameters: { session: { user: { role: 'buyer', companyId: 'acme-inc' } } }
};

export const Approver: Story = {
  parameters: { session: { user: { role: 'approver', companyId: 'acme-inc' } } }
};

export const Admin: Story = {
  parameters: { session: { user: { role: 'admin', companyId: 'acme-inc' } } }
};

