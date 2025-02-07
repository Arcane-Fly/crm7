"use client";

import React, { Suspense, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { CORE_SECTIONS } from '@/config/navigation-config';
import { useNavigationAccess } from '@/hooks/use-navigation-access';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { errorTracker } from '@/lib/error-tracking';
import { cn } from '@/lib/utils';

// Error Fallback Component with better error details
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  useEffect(() => {
    errorTracker.trackError(error, {
      componentName: 'UnifiedNavigation',
      action: 'render_error',
    });
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      role="alert"
      className="p-4 bg-destructive/10 text-destructive rounded-md"
    >
      <h2 className="font-semibold">Navigation Error</h2>
      <p className="text-sm">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 text-sm underline hover:no-underline"
      >
        Try again
      </button>
    </motion.div>
  );
};

// Loading Component with animation
const NavigationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="animate-pulse"
  >
    <div className="h-12 bg-muted rounded-md mb-4" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-8 bg-muted rounded-md" />
      ))}
    </div>
  </motion.div>
);

// Navigation Section Component with animations
const NavigationSection = ({ section, isActive }) => {
  const { hasAccess } = useNavigationAccess();
  
  if (!hasAccess(section.roles)) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "p-4 rounded-lg transition-colors",
        isActive && "bg-primary/10"
      )}
    >
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
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <a
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 rounded-md text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    "transition-colors duration-200"
                  )}
                >
                  {item.title}
                </a>
              </motion.li>
            )
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

// Main Navigation Component
export const UnifiedNavigation = ({ children }) => {
  const pathname = usePathname();
  const { isLoading, filterCoreSections } = useNavigationAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const accessibleSections = filterCoreSections(CORE_SECTIONS);
  const activeSection = accessibleSections.find(
    section => pathname.startsWith(`/${section.id}`)
  );

  // Initialize keyboard navigation
  useKeyboardNavigation({
    onToggleMenu: () => setIsMobileMenuOpen(prev => !prev),
    onFocusSearch: () => searchRef.current?.focus(),
  });

  // Initialize error tracking
  useEffect(() => {
    errorTracker.initialize();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50"
        >
          <Suspense fallback={<NavigationSkeleton />}>
            {isLoading ? (
              <NavigationSkeleton />
            ) : (
              <div className="space-y-4 p-4 overflow-y-auto">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder="Quick search... (/)"
                    className="w-full pl-8 pr-4 py-2 text-sm bg-background border rounded-md"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {accessibleSections.map((section) => (
                    <NavigationSection
                      key={section.id}
                      section={section}
                      isActive={activeSection?.id === section.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Suspense>
        </motion.aside>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -320 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed inset-0 z-50 bg-background"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </motion.button>
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedNavigation;
