'use client';

import { ChevronRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  children: ReactNode;
  className?: string;
  separator?: ReactNode;
  isCollapsed?: boolean;
  maxItems?: number;
}

interface BreadcrumbItemProps {
  href?: string;
  children: ReactNode;
  isLast?: boolean;
  className?: string;
}

interface BreadcrumbEllipsisProps {
  items: Array<{ href: string; label: string }>;
}

function BreadcrumbEllipsis({ items }: BreadcrumbEllipsisProps): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 font-normal hover:bg-transparent"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Show more items</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link
              href={item.href}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BreadcrumbItem({
  href,
  children,
  isLast,
  className,
}: BreadcrumbItemProps): JSX.Element {
  const Component = href && !isLast ? Link : 'span';

  return (
    <Component
      href={href as string}
      className={cn(
        'text-sm font-medium',
        isLast ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      aria-current={isLast ? 'page' : undefined}
    >
      {children}
    </Component>
  );
}

export function Breadcrumb({
  children,
  className,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground/40" />,
  isCollapsed = true,
  maxItems = 3,
}: BreadcrumbProps): JSX.Element {
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  // If we don't need to collapse or have fewer items than maxItems
  if (!isCollapsed || totalItems <= maxItems) {
    return (
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center', className)}
      >
        <ol className="flex items-center gap-2">
          {childrenArray.map((child, index) => (
            <li key={index} className="flex items-center gap-2">
              {child}
              {index < totalItems - 1 && separator}
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  // Calculate items to show when collapsed
  const firstItem = childrenArray[0];
  const lastItems = childrenArray.slice(-2);
  const middleItems = childrenArray.slice(1, -2).map((child: unknown) => ({
    href: child.props.href,
    label: child.props.children,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center', className)}
    >
      <ol className="flex items-center gap-2">
        <li className="flex items-center gap-2">
          {firstItem}
          {separator}
        </li>
        <li className="flex items-center gap-2">
          <BreadcrumbEllipsis items={middleItems} />
          {separator}
        </li>
        {lastItems.map((child, index) => (
          <li key={index} className="flex items-center gap-2">
            {child}
            {index < lastItems.length - 1 && separator}
          </li>
        ))}
      </ol>
    </nav>
  );
}
