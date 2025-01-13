'use client'

import TopNav from './TopNav'
import { Sidebar } from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <TopNav />
      <Sidebar />
      <main className='ml-64 pt-14'>{children}</main>
    </div>
  )
}
