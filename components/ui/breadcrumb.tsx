import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  segments: {
    title: string
    href: string
  }[]
}

export function Breadcrumb({ segments, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <React.Fragment key={segment.href}>
            <Link
              href={segment.href}
              className={cn(
                'hover:text-foreground',
                isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {segment.title}
            </Link>
            {!isLast && (
              <ChevronRight 
                className="h-4 w-4 text-muted-foreground" 
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
