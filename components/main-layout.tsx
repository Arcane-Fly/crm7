'use client'

import { MainNav } from './dashboard/main-nav'
import { UserNav } from './dashboard/user-nav'
import { SearchBar } from './dashboard/search'
import { Sidebar } from './ui/Sidebar'
import { Button } from './ui/button'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  FileText,
  AlertTriangle,
  Settings,
} from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-screen'>
      <Sidebar>
        <div className='space-y-4 py-4'>
          <div className='px-3 py-2'>
            <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
              Labour Hire CRM
            </h2>
            <div className='space-y-1'>
              <Button variant='secondary' className='w-full justify-start'>
                <LayoutDashboard className='mr-2 h-4 w-4' />
                Dashboard
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <Users className='mr-2 h-4 w-4' />
                Apprentices
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <GraduationCap className='mr-2 h-4 w-4' />
                Qualifications
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <Briefcase className='mr-2 h-4 w-4' />
                Host Employers
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <DollarSign className='mr-2 h-4 w-4' />
                Funding Programs
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <FileText className='mr-2 h-4 w-4' />
                Funding Claims
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <AlertTriangle className='mr-2 h-4 w-4' />
                Compliance
              </Button>
              <Button variant='ghost' className='w-full justify-start'>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </Sidebar>
      <div className='flex-1'>
        <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='container flex h-14 items-center'>
            <MainNav />
            <div className='ml-auto flex items-center space-x-4'>
              <SearchBar />
              <UserNav />
            </div>
          </div>
        </header>
        <main className='container py-6'>{children}</main>
      </div>
    </div>
  )
}
