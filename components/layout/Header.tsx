'use client'

import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'
import { SidebarContext } from './improved-sidebar'
import { useContext } from 'react'

export function Header() {
  const sidebar = useContext(SidebarContext)

  if (!sidebar) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          className="mr-2 px-2 hover:bg-transparent"
          onClick={() => sidebar.setOpenMobile(true)}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
