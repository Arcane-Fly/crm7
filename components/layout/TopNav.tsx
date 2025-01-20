'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  Clock,
  Shield,
  BarChart2,
  Settings,
} from 'lucide-react'

const topNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Candidates & Employees',
    href: '/candidates',
    icon: Users,
  },
  {
    title: 'Clients / Host Employers',
    href: '/clients',
    icon: Building2,
  },
  {
    title: 'Jobs & Placements',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    title: 'Timesheets & Payroll',
    href: '/timesheets',
    icon: Clock,
  },
  {
    title: 'Compliance & Training',
    href: '/compliance',
    icon: Shield,
  },
  {
    title: 'Reporting & Analytics',
    href: '/reporting',
    icon: BarChart2,
  },
  {
    title: 'Settings & Admin',
    href: '/settings',
    icon: Settings,
  },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <div className='fixed left-0 right-0 top-0 z-50 border-b bg-white'>
      <div className='flex h-14 items-center gap-4 px-4'>
        <div className='flex items-center gap-2 font-semibold'>
          <span className='text-lg'>GTO Manager</span>
        </div>
        <nav className='flex flex-1 items-center gap-1'>
          {topNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-blue-50 font-medium text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className='h-4 w-4' />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
