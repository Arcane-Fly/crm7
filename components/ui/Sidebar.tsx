'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        'hidden border-r bg-background lg:block lg:w-64 lg:flex-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
