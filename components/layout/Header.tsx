'use client'

import { UserNav } from '@/components/user-nav'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { MenuIcon } from 'lucide-react'
import { useSidebarContext } from './improved-sidebar'

export function Header() {
  const { toggleSidebar } = useSidebarContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          className="mr-2 px-2 hover:bg-transparent lg:hidden"
          onClick={toggleSidebar}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1" />
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}
