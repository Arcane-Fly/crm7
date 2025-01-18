'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn('hidden border-r bg-background lg:block lg:w-64 lg:flex-none', className)}
      {...props}
    >
      <div className='space-y-4 py-4'>
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Labour Hire CRM</h2>
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
      {children}
    </div>
  )
}
