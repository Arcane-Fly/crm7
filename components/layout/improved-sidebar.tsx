'use client';

import { motion } from 'framer-motion';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NavItem } from '@/config/navigation';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => undefined,
  isMobileOpen: false,
  setIsMobileOpen: () => undefined,
});

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ children, className }: SidebarProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isCollapsed,
      setIsCollapsed,
      isMobileOpen,
      setIsMobileOpen,
    }),
    [isCollapsed, isMobileOpen],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className={cn('relative h-screen', className)}>{children}</div>
    </SidebarContext.Provider>
  );
}

interface SidebarToggleProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function SidebarToggle({ className }: SidebarToggleProps): React.ReactElement {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } =
    React.useContext(SidebarContext);

  const handleToggle = React.useCallback(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  }, [isCollapsed, isMobileOpen, setIsCollapsed, setIsMobileOpen]);

  return (
    <Button
      variant='ghost'
      className={cn('h-10 w-10', className)}
      onClick={handleToggle}
    >
      <MenuIcon className='h-4 w-4' />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className }: SidebarContentProps): React.ReactElement {
  const pathname = usePathname() ?? '/';
  // isCollapsed is used in renderItems
  const { isCollapsed } = React.useContext(SidebarContext);
  const [activeItem, setActiveItem] = React.useState<NavItem | null>(null);

  React.useEffect(() => {
    const current = MAIN_NAV_ITEMS.find(
      (item) => pathname && item.href && pathname.startsWith(item.href)
    );
    setActiveItem(current || null);
  }, [pathname]);

  const renderItems = React.useCallback((navItem: NavItem) => {
    if (!navItem.children || isCollapsed) return null;
    if (!navItem.children) return null;
    return navItem.children.map((item) => (
      <Link
        key={item.href}
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
          pathname === item.href && 'bg-accent text-accent-foreground',
        )}
      >
        {item.icon && <item.icon className='h-4 w-4' />}
        <span>{item.label}</span>
      </Link>
    ));
  }, [pathname]);

  return (
    <ScrollArea className={cn('h-full py-6', className)}>
      <nav className='grid items-start gap-2 px-4'>
        {MAIN_NAV_ITEMS.map((item) => (
          <div
            key={item.slug}
            className='grid gap-2'
          >
            <h4 className='text-sm font-medium'>{item.label}</h4>
            {activeItem && renderItems(activeItem)}
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}

export function useSidebar(): SidebarContextType {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function MobileSidebar(): React.ReactElement {
  const { isMobileOpen } = React.useContext(SidebarContext);

  return (
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: isMobileOpen ? 0 : '-100%' }}
      transition={{ duration: 0.2 }}
      className='fixed left-0 top-0 z-50 h-screen w-[var(--sidebar-width)] border-r bg-background lg:hidden'
    >
      <SidebarContent />
    </motion.aside>
  );
}
