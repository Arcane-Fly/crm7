import '@/styles/globals.css'

import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/ui/navbar'
import { Sidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM System',
  description: 'A modern CRM system built with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background antialiased', inter.className)}>
        <Providers>
          <div className='relative flex min-h-screen flex-col'>
            <Navbar />
            <div className='flex-1'>
              <div className='container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
                <aside className='fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block'>
                  <Sidebar />
                </aside>
                <main className='flex w-full flex-col overflow-hidden px-4 py-6 md:px-6'>
                  {children}
                </main>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
