"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { CORE_SECTIONS } from '@/config/navigation-config';
import { useNavigationAccess } from '@/hooks/use-navigation-access';
import { cn } from '@/lib/utils';

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="p-4 bg-destructive/10 text-destructive rounded-md">
    <h2 className="font-semibold">Navigation Error</h2>
    <p className="text-sm">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="mt-2 text-sm underline hover:no-underline"
    >
      Try again
    </button>
  </div>
);

// Loading Component
const NavigationSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-muted rounded-md mb-4" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 bg-muted rounded-md" />
      ))}
    </div>
  </div>
);

// Navigation Section Component
const NavigationSection = ({ section, isActive }) => {
  const { hasAccess } = useNavigationAccess();
  
  if (!hasAccess(section.roles)) return null;
  
  return (
    <div className={cn(
      "p-4 rounded-lg transition-colors",
      isActive && "bg-primary/10"
    )}>
      <div className="flex items-center gap-2 mb-2">
        {section.icon && <section.icon className="w-5 h-5" />}
        <h2 className="font-semibold">{section.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {section.description}
      </p>
      <nav>
        <ul className="space-y-1">
          {section.items.map((item) => (
            hasAccess(item.roles) && (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 rounded-md text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                >
                  {item.title}
                </a>
              </li>
            )
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Main Navigation Component
export const UnifiedNavigation = ({ children }) => {
  const pathname = usePathname();
  const { isLoading, filterCoreSections } = useNavigationAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const accessibleSections = filterCoreSections(CORE_SECTIONS);
  const activeSection = accessibleSections.find(
    section => pathname.startsWith(`/${section.id}`)
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
          <Suspense fallback={<NavigationSkeleton />}>
            {isLoading ? (
              <NavigationSkeleton />
            ) : (
              <div className="space-y-4 p-4 overflow-y-auto">
                {accessibleSections.map((section) => (
                  <NavigationSection
                    key={section.id}
                    section={section}
                    isActive={activeSection?.id === section.id}
                  />
                ))}
              </div>
            )}
          </Suspense>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Suspense fallback={<NavigationSkeleton />}>
              <div className="p-4 overflow-y-auto">
                {accessibleSections.map((section) => (
                  <NavigationSection
                    key={section.id}
                    section={section}
                    isActive={activeSection?.id === section.id}
                  />
                ))}
              </div>
            </Suspense>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedNavigation;
