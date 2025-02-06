'use client';

import Link from 'next/link';
import { UserButton } from '@/components/auth/user-button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export function TopNav(): React.ReactElement {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center justify-between">
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
    </header>
  );
}
