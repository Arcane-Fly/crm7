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
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
