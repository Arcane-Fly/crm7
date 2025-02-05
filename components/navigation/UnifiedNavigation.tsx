"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { MAIN_NAV_ITEMS, SECTIONS, type NavItem } from '@/config/navigation';
import { KEYBOARD_SHORTCUTS } from '@/config/constants';
import { cn } from '@/lib/utils';
import { useLockBody } from '@/lib/hooks/use-lock-body';

//
// Accessibility: "Skip to content" link so that keyboard/screen reader users can bypass nav
//
const SkipToContent: React.FC = (): React.ReactElement => {
  return (
    <a 
      href="#main-content" 
      className="absolute left-4 top-2 z-50 rounded bg-primary p-2 text-primary-foreground transition transform -translate-y-full focus:translate-y-0 focus:outline-none"
    >
      Skip to content
    </a>
  );
};

//
// TopNavigation: displays the main (horizontal) navigation and supports both Alt+number and arrow key navigation
//
interface TopNavigationProps {
  pathname: string;
}

const TopNavigation: React.FC<TopNavigationProps> = React.memo(({ pathname }) => {
  const router = useRouter();
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Search focus shortcut (/ key)
      if (e.key === KEYBOARD_SHORTCUTS.FOCUS_SEARCH && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.querySelector<HTMLElement>('[role="search"]')?.focus();
      }
      // Section navigation using Alt+number
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key);
        if (!isNaN(num) && num > 0 && num <= MAIN_NAV_ITEMS.length) {
          e.preventDefault();
          const item = MAIN_NAV_ITEMS[num - 1];
          if (item.href) {
            router.push(item.href);
          }
        }
      }
      // Arrow key navigation between nav links
      if (document.activeElement?.tagName === 'A' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const currentIndex = navRefs.current.findIndex(ref => ref === document.activeElement);
        if (currentIndex !== -1) {
          const nextIndex = e.key === 'ArrowLeft' 
            ? (currentIndex - 1 + navRefs.current.length) % navRefs.current.length
            : (currentIndex + 1) % navRefs.current.length;
          navRefs.current[nextIndex]?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return (): React.ReactElement => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return (
    <header className="bg-background border-b">
      <nav
        className="container mx-auto flex items-center space-x-4 px-4 py-2"
        role="navigation"
        aria-label="Main Navigation"
      >
        {MAIN_NAV_ITEMS.map((item, index) => {
          const isActive = item.href ? pathname.startsWith(item.href) : false;
          const shortcutNumber = index + 1;
          return (
            <Link
              key={item.href}
              ref={el => navRefs.current[index] = el}
              href={item.href ?? '#'}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded transition-colors focus:ring focus:ring-offset-2 relative group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={`${item.label || item.title} (Alt+${shortcutNumber})`}
            >
              <span className="flex items-center gap-2">
                {item.icon && React.createElement(item.icon, { className: "h-4 w-4" })}
                {item.label || item.title}
                <span className="hidden group-hover:inline-block absolute -top-1 -right-1 text-xs bg-muted px-1 rounded">
                  Alt+{shortcutNumber}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
});

TopNavigation.displayName = 'TopNavigation';

//
// SidebarNavigation: displays the sub-navigation based on the active section
//
interface SidebarNavigationProps {
  activeNavLabel: string;
  sectionItems: NavItem[];
  pathname: string;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = React.memo(({ activeNavLabel, sectionItems, pathname }) => {
  const sideNavRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      // Up/Down arrow key navigation between sidebar links
      if (document.activeElement?.tagName === 'A' && 
          (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = sideNavRefs.current.findIndex(ref => ref === document.activeElement);
        if (currentIndex !== -1) {
          const nextIndex = e.key === 'ArrowUp'
            ? (currentIndex - 1 + sideNavRefs.current.length) % sideNavRefs.current.length
            : (currentIndex + 1) % sideNavRefs.current.length;
          sideNavRefs.current[nextIndex]?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return (): React.ReactElement => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <aside className="hidden md:block w-64 border-r bg-background">
      <nav
        className="px-4 py-4"
        role="navigation"
        aria-label={`${activeNavLabel} Sub Navigation`}
      >
        <ul className="space-y-2">
          {sectionItems.map((navItem, index) => {
            const isActive = navItem.href ? pathname.startsWith(navItem.href) : false;
            return (
              <li key={navItem.href}>
                <Link
                  ref={el => sideNavRefs.current[index] = el}
                  href={navItem.href ?? '#'}
                  className={cn(
                    'block px-3 py-2 text-sm rounded transition-colors focus:ring focus:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {navItem.label || navItem.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
});

SidebarNavigation.displayName = 'SidebarNavigation';

//
// MobileNavigation: displays the mobile menu with auto-focus and Escape key support
//
interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  sectionItems: NavItem[];
  activeNavLabel: string;
  pathname: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isOpen, 
  onClose, 
  sectionItems, 
  activeNavLabel,
  pathname 
}) => {
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  useLockBody(isOpen);

  // Auto focus the first link when the mobile menu opens
  useEffect((): React.ReactElement => {
    if (isOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [isOpen]);

  // Close mobile menu on Escape key press
  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect((): React.ReactElement => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return (): React.ReactElement => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 bg-background md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="text-lg font-semibold">{activeNavLabel}</span>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-accent"
            aria-label="Close navigation menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4" role="navigation">
          <ul className="space-y-2">
            {sectionItems.map((navItem, index) => {
              const isActive = navItem.href ? pathname.startsWith(navItem.href) : false;
              return (
                <li key={navItem.href}>
                  <Link
                    href={navItem.href ?? '#'}
                    className={cn(
                      'block px-3 py-2 text-sm rounded transition-colors focus:ring focus:ring-offset-2',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    ref={index === 0 ? firstLinkRef : undefined}
                  >
                    {navItem.label || navItem.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

//
// UnifiedNavigation: combines top navigation, sub-navigation, and mobile menu
//
interface UnifiedNavigationProps {
  children?: React.ReactNode;
}

export const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ children }) => {
  const pathname = usePathname() || '/';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Memoize the active main navigation item
  const activeNav = useMemo(() => {
    return MAIN_NAV_ITEMS.find((item) => item.href && pathname.startsWith(item.href)) || MAIN_NAV_ITEMS[0];
  }, [pathname]);

  const activeSectionKey = activeNav.slug || 'dashboard';

  // Memoize section items for the active main nav
  const sectionItems = useMemo(() => {
    return SECTIONS[activeSectionKey] || [];
  }, [activeSectionKey]);

  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      <TopNavigation pathname={pathname} />
      <div className="flex flex-1">
        <SidebarNavigation
          activeNavLabel={activeNav.label || activeNav.title || ''}
          sectionItems={sectionItems}
          pathname={pathname}
        />
        <main id="main-content" className="flex-1 p-6">
          <div className="md:hidden mb-4">
            <button
              onClick={(): React.ReactElement => setIsMobileNavOpen(true)}
              className="p-2 rounded hover:bg-accent"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          {children}
        </main>
      </div>
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={(): React.ReactElement => setIsMobileNavOpen(false)}
        sectionItems={sectionItems}
        activeNavLabel={activeNav.label || activeNav.title || ''}
        pathname={pathname}
      />
    </div>
  );
};

export default UnifiedNavigation;
