'use client'

import { useMemo } from 'react'
import { useLockBody } from '@/lib/hooks/use-lock-body'

export function AppSidebar({ isOpen }: { isOpen: boolean }) {
  useLockBody(isOpen) // Move hook to component level

  const content = useMemo(() => {
    // Sidebar content here
    return null
  }, [])

  return content
}
