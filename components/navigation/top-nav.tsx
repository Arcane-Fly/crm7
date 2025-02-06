'use client';

import Link from 'next/link';
import { UserButton } from '@/components/auth/user-button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

export function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-50">
      <nav className="h-14 flex items-center justify-between px-4">
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">CRM7</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </nav>
    </div>
  );
}
