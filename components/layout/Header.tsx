'use client';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export function Header({ className }: HeaderProps): JSX.Element {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();

  const toggleMobileMenu = (): void => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSidebar = (): void => {
    setIsCollapsed(!isCollapsed);
  };

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
          onClick={toggleMobileMenu}
          aria-label='Toggle mobile menu'
        >
          <MenuIcon className='h-5 w-5' />
        </Button>

        <Button
          variant='ghost'
          className='mr-2 hidden px-2 hover:bg-transparent lg:flex'
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon className='h-5 w-5' />
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
            {MAIN_NAV_ITEMS.map((item: unknown) => {
              const isActive = item.href ? pathname?.startsWith(item.href) : false;
              const href = item.href ?? '#';
              const key = item.slug ?? item.href ?? item.title;
              return (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    'flex items-center space-x-2 whitespace-nowrap text-sm font-medium transition-colors hover:text-primary',
                    isActive ? 'text-foreground' : 'text-foreground/60',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && <item.icon className='h-4 w-4' />}
                  <span>{item.label ?? item.title}</span>
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
