import * as React from "react"
import { ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
  children: React.ReactNode
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  href?: string
  children: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator = <ChevronRight className="h-4 w-4" />, children, className, ...props }, ref) => {
    const items = React.Children.toArray(children).filter(Boolean)

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        <ol className="flex items-center">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <li className="mx-2 select-none">{separator}</li>}
              {item}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ href, children, className, ...props }, ref) => {
    const content = href ? (
      <a href={href} className="hover:underline">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    )

    return (
      <li ref={ref} className={cn("", className)} {...props}>
        {content}
      </li>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export { Breadcrumb, BreadcrumbItem }

