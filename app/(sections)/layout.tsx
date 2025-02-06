import { type ReactNode } from 'react';
import { SideNav } from '@/components/navigation/side-nav';
import { TopNav } from '@/components/navigation/top-nav';

interface SectionsLayoutProps {
  children: ReactNode;
}

export default function SectionsLayout({ children }: SectionsLayoutProps) {
  return (
    <div className="flex h-screen">
      <SideNav />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-background p-4">{children}</main>
      </div>
    </div>
  );
}
