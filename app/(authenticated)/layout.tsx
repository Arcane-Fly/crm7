'use client'

import { Header } from '@/components/header'
import { MainNav } from '@/components/main-nav'
import { SidebarProvider } from '@/components/layout/improved-sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className='min-h-screen flex flex-col bg-gray-50'>
        <Header />
        <div className='flex-1 flex'>
          <AppSidebar />
          <main className='flex-1 flex flex-col'>
            <MainNav />
            <div className='flex-1 p-4 md:p-6 overflow-y-auto space-y-6'>
              <div className='container mx-auto max-w-7xl'>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}