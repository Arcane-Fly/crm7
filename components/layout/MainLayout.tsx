import { Header } from './Header'
import { Sidebar } from './improved-sidebar'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { cn } from '@/lib/utils'
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/config/constants'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <Sidebar />
        <div 
          className={cn(
            'flex flex-col transition-all duration-300 ease-in-out',
            'lg:ml-[var(--sidebar-width)]',
            className
          )}
          style={{ 
            '--header-height': `${HEADER_HEIGHT}px`,
            '--sidebar-width': `${SIDEBAR_WIDTH}px`,
            '--sidebar-collapsed-width': `${SIDEBAR_COLLAPSED_WIDTH}px`
          } as React.CSSProperties}
        >
          <Header />
          <main className="container mx-auto p-6 pt-[calc(var(--header-height)+1.5rem)]">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  )
}
