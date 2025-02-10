'use client';

import { CORE_SECTIONS, type CoreSection } from '@/config/navigation-config';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { useNavigationAccess } from '@/hooks/use-navigation-access';
import { errorTracker } from '@/lib/error-tracking';
import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationSectionProps {
  section: CoreSection;
  isActive: boolean;
  isCollapsed: boolean;
}

interface UnifiedNavigationProps {
  children: ReactNode;
}

const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  useEffect(() => {
    errorTracker.trackError(error, {
      componentName: 'UnifiedNavigation',
      action: 'render_error',
    });
  }, [error]);

  return (
    <div className="p-4 text-sm">
      <h3 className="font-semibold text-red-500">Navigation Error</h3>
      <p className="mt-1 text-muted-foreground">Please try refreshing the page</p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm" className="mt-2">
        Retry
      </Button>
    </div>
  );
};

function NavigationSkeleton() {
  return (
    <div className="flex h-screen animate-pulse flex-col space-y-4 p-4">
      <div className="h-8 w-3/4 rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

function NavigationSection({ section, isActive, isCollapsed }: NavigationSectionProps) {
  const { canAccess } = useNavigationAccess();
  const pathname = usePathname();

  const filteredItems = section.items.filter((item) => canAccess(item.roles));

  if (filteredItems.length === 0) return null;

  return (
    <div className={`py-2 ${isActive && 'bg-accent/50'}`}>
      <div className="flex items-center px-3 py-1.5">
        {section.icon && <section.icon className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />}
        {!isCollapsed && <span className="text-sm font-medium">{section.title}</span>}
      </div>
      <div className="mt-1">
        {filteredItems.map((item) => {
          const isItemActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href || '#'}
                  className={`flex items-center px-3 py-1.5 text-sm transition-colors hover:bg-accent/50 ${
                    isItemActive && 'bg-accent font-medium text-accent-foreground'
                  }`}
                >
                  {Icon && <Icon className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="flex items-center">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export function UnifiedNavigation({ children }: UnifiedNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { canAccess } = useNavigationAccess();
  const pathname = usePathname();

  const filteredSections = CORE_SECTIONS.filter(
    (section) =>
      canAccess(section.roles) &&
      (searchQuery
        ? section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.items.some(
            (item) =>
              canAccess(item.roles) && item.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true)
  );

  useKeyboardNavigation({
    onSearchFocus: () => searchRef.current?.focus(),
    onCollapse: () => setIsCollapsed((prev) => !prev),
  });

  return (
    <div className="flex">
      {/* Navigation Sidebar */}
      <aside
        className={`relative flex flex-col border-r bg-background ${
          isCollapsed ? 'w-[70px]' : 'w-[240px]'
        }`}
      >
        {/* Header */}
        <div className="flex h-[60px] items-center justify-between border-b px-3 py-2">
          {!isCollapsed && <span className="text-lg font-semibold">CRM7</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`h-8 w-8 ${isCollapsed && 'mx-auto'}`}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="relative px-3 py-2">
            <Search className="absolute left-5 top-[13px] h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                className="absolute right-5 top-[13px] h-4 w-4 cursor-pointer text-muted-foreground"
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        )}

        {/* Navigation Sections */}
        <ScrollArea className="flex-1">
          <Suspense fallback={<NavigationSkeleton />}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {filteredSections.map((section) => (
                <NavigationSection
                  key={section.id}
                  section={section}
                  isActive={pathname.startsWith(`/${section.id}`)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </ErrorBoundary>
          </Suspense>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
