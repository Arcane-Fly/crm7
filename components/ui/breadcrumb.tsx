'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {
  href?: string
  children: React.ReactNode
}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('flex items-center space-x-2', className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(children) - 1 && (
            <ChevronRight className="h-4 w-4" />
          )}
        </>
      ))}
    </nav>
  )
}

export function BreadcrumbItem({ href, children, className, ...props }: BreadcrumbItemProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn('text-sm text-muted-foreground hover:text-foreground', className)}
        {...props}
      >
        {children}
      </Link>
    )
  }

  return (
    <span
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
    </span>
  )
}
