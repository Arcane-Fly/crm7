'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { MAIN_NAV_ITEMS, SECTIONS } from '@/config/navigation'
import { useMounted } from '@/lib/hooks/use-mounted'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

function getBreadcrumbSegments(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    
    // Find main nav item
    if (segments.indexOf(segment) === 0) {
      const mainItem = MAIN_NAV_ITEMS.find(item => item.slug === segment)
      if (mainItem) {
        breadcrumbs.push({
          title: mainItem.label,
          href: mainItem.href,
        })
        continue
      }
    }
    
    // Find section item
    const sectionItems = SECTIONS[segments[0] as keyof typeof SECTIONS] || []
    const sectionItem = sectionItems.find(item => item.href === currentPath)
    if (sectionItem) {
      breadcrumbs.push({
        title: sectionItem.title,
        href: sectionItem.href,
      })
    }
  }
  
  return breadcrumbs
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[300px]" />
      <div className="grid gap-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const mounted = useMounted()
  const segments = getBreadcrumbSegments(pathname)

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb 
            segments={segments} 
            className="mb-4" 
            aria-label="Page navigation"
          />
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  )
}