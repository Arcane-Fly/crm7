'use client';

import { usePathname } from 'next/navigation';
import { Suspense, type ReactElement, type ReactNode } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { MAIN_NAV_ITEMS, SECTIONS } from '@/config/navigation';
import { useMounted } from '@/lib/hooks/use-mounted';

interface BreadcrumbSegment {
  title: string;
  href: string;
}

function getBreadcrumbSegments(pathname: string | null): BreadcrumbSegment[] {
  if (!pathname) return [];

  const segments = pathname.split('/').filter(Boolean: unknown);
  const breadcrumbs: BreadcrumbSegment[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Find main nav item
    if (segments.indexOf(segment: unknown) === 0) {
      const mainItem = MAIN_NAV_ITEMS.find((item: unknown) => item.slug === segment);
      if (mainItem?.href) {
        breadcrumbs.push({
          title: mainItem.label ?? mainItem.title,
          href: mainItem.href,
        });
        continue;
      }
    }

    // Find section item
    const sectionItems = SECTIONS[segments[0]] ?? [];
    const sectionItem = sectionItems.find((item: unknown) => item.href === currentPath);
    if (sectionItem?.href) {
      breadcrumbs.push({
        title: sectionItem.title,
        href: sectionItem.href ?? '#',
      });
    }
  }

  return breadcrumbs;
}

function LoadingSkeleton(): ReactElement {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-4 w-[300px]' />
      <div className='grid gap-4'>
        <Skeleton className='h-[200px] w-full' />
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_: unknown, i) => (
            <Skeleton
              key={i}
              className='h-[100px] w-full'
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SectionsLayout({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname();
  const mounted = useMounted();
  const segments = getBreadcrumbSegments(pathname: unknown);

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className='hidden' />;
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='container flex-1 space-y-4 py-8'>
        <Breadcrumb>
          <BreadcrumbItem href='/'>Home</BreadcrumbItem>
          {segments.map((segment: unknown, i) => (
            <BreadcrumbItem
              key={i}
              href={segment.href}
            >
              {segment.title}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>

        <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>
      </div>
    </div>
  );
}
