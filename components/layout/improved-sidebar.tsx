'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MAIN_NAV_ITEMS, SECTIONS, type Section } from '@/config/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip } from '@/components/ui/tooltip'
import { useLockBody } from '@/lib/hooks/use-lock-body'
import { KEYBOARD_SHORTCUTS } from '@/config/constants'

interface SidebarContextValue {
  isCollapsed: boolean
  toggleCollapse: () => void
  setOpenMobile: (open: boolean) => void
}

export const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [_isMobileOpen, setOpenMobile] = React.useState(false)

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleCollapse()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCollapse])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setOpenMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Lock body scroll when mobile sidebar is open
  useLockBody(isMobileOpen)

  const currentSection = React.useMemo(() => {
    return MAIN_NAV_ITEMS.find(item => 
      pathname.startsWith(`/${item.slug}`)
    )?.slug as Section | undefined
  }, [pathname])

  const sectionItems = currentSection ? SECTIONS[currentSection] : []

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-[var(--sidebar-width)] border-r bg-background transition-all duration-300 ease-in-out',
          isCollapsed && 'w-[var(--sidebar-collapsed-width)]',
          'hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[var(--header-height)] items-center justify-between px-4">
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold">CRM System</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-9 w-9"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? '→' : '←'}
            </Button>
          </div>
          <ScrollArea className="flex-1 py-2">
            <nav className="grid gap-1 px-2">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(`/${item.slug}`)
                return (
                  <Tooltip
                    key={item.slug}
                    content={isCollapsed ? item.label : null}
                    side="right"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive ? 'bg-accent text-accent-foreground' : 'transparent'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </Tooltip>
                )
              })}
            </nav>
            {currentSection && !isCollapsed && (
              <div className="mt-4">
                <div className="px-4 py-2">
                  <h4 className="text-sm font-semibold">{currentSection.toUpperCase()}</h4>
                </div>
                <nav className="grid gap-1 px-2">
                  {sectionItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          isActive ? 'bg-accent/50 text-accent-foreground' : 'transparent'
                        )}
                      >
                        {item.title}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 top-0 z-50 h-screen w-[var(--sidebar-width)] border-r bg-background lg:hidden"
            >
              {/* Mobile sidebar content - similar to desktop but always expanded */}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
      >
        ☰
      </Button>
    </>
  )
}
