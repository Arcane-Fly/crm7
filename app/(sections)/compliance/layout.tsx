'use client';

import { Sidebar } from '@/components/ui/sidebar';

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <main className='flex-1 px-4 py-8'>{children}</main>
    </div>
  );
}
