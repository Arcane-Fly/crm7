'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}
    >
      <Link href='/' className='flex items-center transition-colors hover:text-foreground'>
        <Home className='h-4 w-4' />
        <span className='sr-only'>Home</span>
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1

        return (
          <div key={segment} className='flex items-center'>
            <ChevronRight className='h-4 w-4' />
            <Link
              href={href}
              className={cn(
                'ml-2 capitalize transition-colors hover:text-foreground',
                isLast && 'pointer-events-none text-foreground'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {segment.replace(/-/g, ' ')}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
