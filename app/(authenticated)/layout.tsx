'use client'

import { SidebarProvider } from '@/components/layout/improved-sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/Header'
import { HEADER_HEIGHT } from '@/config/constants'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <div 
          className="flex flex-1"
          style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
        >
          <AppSidebar isOpen={true} />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}