'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Training & Development',
    href: '/training',
  },
  {
    title: 'Safety & WHS',
    href: '/safety',
  },
  {
    title: 'Payroll & Finance',
    href: '/payroll',
  },
  {
    title: 'Human Resources',
    href: '/hr',
  },
  {
    title: 'Client Management',
    href: '/clients',
  },
  {
    title: 'Marketing & Sales',
    href: '/marketing',
  },
  {
    title: 'Compliance & Quality',
    href: '/compliance',
  },
  {
    title: 'Reports & Analytics',
    href: '/reports',
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className='border-b bg-background'>
      <div className='flex h-14 items-center gap-6 overflow-x-auto px-4'>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
