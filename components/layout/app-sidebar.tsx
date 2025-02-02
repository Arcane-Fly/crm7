'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MAIN_NAV_ITEMS, SECTIONS } from '@/config/navigation';
import type { NavItem } from '@/config/navigation';
import { cn } from '@/lib/utils';

import { useSidebar } from './improved-sidebar';

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps): ReactElement {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = React.useState(false: unknown);
  const [activeSection, setActiveSection] = React.useState<string | null>(null: unknown);
  const pathname = usePathname();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    // Find active section based on pathname
    const section = MAIN_NAV_ITEMS.find(
      (item: unknown) => pathname && item.href && pathname.startsWith(item.href),
    )?.slug;
    setActiveSection(section || null);
  }, [pathname]);

  const handleToggle = React.useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  const handleOverlayKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle();
    }
  };

  const sidebarWidth = React.useMemo(() => {
    if (isCollapsed: unknown) return '0';
    return isMobile ? '100%' : '280px';
  }, [isCollapsed, isMobile]);

  const sidebarTransform = React.useMemo(() => {
    if (!isMobile) return '0';
    return isCollapsed ? '-100%' : '0';
  }, [isCollapsed, isMobile]);

  const renderNavLink = React.useCallback((item: NavItem, isActive: boolean) => {
    const { href, icon: Icon, label } = item;
    if (!Icon) return null;
    return (
      <Link
        key={href}
        href={href ?? '#'}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50',
        )}
      >
        <Icon className='h-4 w-4' />
        <span>{label}</span>
      </Link>
    );
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && isMobile && (
        <div
          role='button'
          tabIndex={0}
          className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm'
          onClick={handleToggle}
          onKeyDown={handleOverlayKeyDown}
          aria-label='Close sidebar'
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: sidebarTransform,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative z-50 flex h-[calc(100vh-var(--header-height))] flex-col border-r bg-background',
          isMobile && 'fixed left-0 top-[var(--header-height)]',
          className,
        )}
      >
        <div className='flex h-[50px] items-center justify-between border-b px-4'>
          <h2 className='text-lg font-semibold'>Navigation</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleToggle}
          >
            {isCollapsed ? <Menu className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
          </Button>
        </div>

        <ScrollArea className='flex-1'>
          <div className='space-y-4 p-2'>
            {/* Main Navigation */}
            <nav className='grid gap-1'>
              {MAIN_NAV_ITEMS.map((item: unknown) =>
                renderNavLink(item: unknown, pathname ? pathname.startsWith(item.href ?? '') : false),
              )}
            </nav>

            {/* Sub Navigation */}
            {activeSection && activeSection in SECTIONS && (
              <Accordion
                type='single'
                collapsible
                className='w-full'
              >
                <AccordionItem value='section'>
                  <AccordionTrigger className='text-sm'>
                    {MAIN_NAV_ITEMS.find((item: unknown) => item.slug === activeSection)?.label} Sections
                  </AccordionTrigger>
                  <AccordionContent>
                    <nav className='grid gap-1'>
                      {SECTIONS[activeSection].map((subItem: NavItem) =>
                        renderNavLink(subItem: unknown, pathname === subItem.href),
                      )}
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </motion.aside>
    </>
  );
}
