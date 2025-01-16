'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarContext } from './improved-sidebar'
import { SECTIONS } from '@/config/navigation'
import type { Section } from '@/config/navigation'
import { useLockBody } from '@/lib/hooks/use-lock-body'
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, TRANSITIONS, Z_INDEXES } from '@/config/constants'
import { SidebarSkeleton } from '@/components/ui/skeleton'

export function AppSidebar() {
  const { open, openMobile, setOpenMobile, isMobile } = React.useContext(SidebarContext)
  const pathname = usePathname()

  // Get the top-level section from the pathname
  const topLevel = pathname.split('/')[1] as Section || 'dashboard'
  const items = SECTIONS[topLevel] || []

  const [isLoading, setIsLoading] = React.useState(true)

  // Lock body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (openMobile) {
      useLockBody()
    }
  }, [openMobile])

  // Simulate loading state for smooth transitions between sections
  React.useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [topLevel])

  const sidebarContent = (
    <ScrollArea 
      className="h-full py-6"
      style={{ 
        transition: `width ${TRANSITIONS.DEFAULT} ease-in-out`,
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH 
      }}
    >
      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <div className="space-y-1 px-3">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {topLevel.charAt(0).toUpperCase() + topLevel.slice(1)}
          </h2>
          {items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      )}
    </ScrollArea>
  )

  // Mobile version
  if (isMobile) {
    return (
      <Sheet 
        open={openMobile} 
        onOpenChange={setOpenMobile}
      >
        <SheetContent 
          side="left" 
          className="w-[300px] p-0"
          style={{ zIndex: Z_INDEXES.SIDEBAR }}
          onInteractOutside={() => setOpenMobile(false)}
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop version
  return (
    <div
      className={cn(
        'hidden border-r bg-background lg:block',
        'transition-[width] duration-300 ease-in-out'
      )}
      style={{ 
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        zIndex: Z_INDEXES.SIDEBAR 
      }}
    >
      {sidebarContent}
    </div>
  )
}
