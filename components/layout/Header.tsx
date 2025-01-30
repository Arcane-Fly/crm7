'use client';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

import styles from './header.module.css';
import { useSidebar } from './improved-sidebar';
import { UserNav } from './user-nav';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps): ReactElement {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname() ?? '/';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
        styles.header,
      )}
    >
      <div className='container flex h-14 items-center'>
        <Button
          variant='ghost'
          className='mr-2 px-2 hover:bg-transparent lg:hidden'
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <MenuIcon className='h-5 w-5' />
          <span className='sr-only'>Toggle mobile navigation</span>
        </Button>

        <div className='mr-4 hidden lg:flex'>
          <Link
            href='/'
            className='mr-6 flex items-center space-x-2'
          >
            <span className='hidden font-bold sm:inline-block'>CRM System</span>
          </Link>
        </div>

        <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
          <nav className='flex items-center space-x-6 overflow-x-auto md:overflow-visible'>
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = pathname && item.href ? pathname.startsWith(item.href) : false;
              return (
                <Link
                  key={item.slug}
                  href={item.href || '#'}
                  className={cn(
                    'flex items-center space-x-2 whitespace-nowrap text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-foreground' : 'text-foreground/60',
                  )}
                >
                  <item.icon className='h-4 w-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className='flex items-center space-x-4'>
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
