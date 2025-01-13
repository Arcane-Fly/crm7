'use client'

import { Header } from '@/components/layout/header'
import { SidebarProvider } from '@/components/layout/improved-sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ThemeProvider } from '@/components/theme-provider'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className='min-h-screen flex flex-col bg-gray-50'>
          <Header />
          <div className='flex-1 flex'>
            <AppSidebar />
            <main className='flex-1 flex flex-col'>
              <div className='flex-1 p-4 md:p-6 overflow-y-auto space-y-6'>
                <div className='container mx-auto max-w-7xl'>
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}