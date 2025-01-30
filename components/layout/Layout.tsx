'use client';

import { Sidebar } from './Sidebar';
import TopNav from './TopNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <TopNav />
      <Sidebar />
      <main className='ml-64 pt-14'>{children}</main>
    </div>
  );
}
