import React from 'react'
import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@radix-ui/react-icons'

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className='flex' aria-label='Breadcrumb'>
      <ol className='flex items-center space-x-2'>
        <li>
          <Link href='/' className='flex items-center text-gray-500 hover:text-gray-700'>
            <HomeIcon className='h-4 w-4' />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className='flex items-center'>
            <ChevronRightIcon className='h-4 w-4 text-gray-400' />
            <Link
              href={item.href}
              className={`ml-2 text-sm font-medium ${
                index === items.length - 1 ? 'text-gray-700' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
