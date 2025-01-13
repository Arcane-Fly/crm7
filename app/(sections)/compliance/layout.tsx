'use client'

import { Sidebar } from '@/components/ui/Sidebar'

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Compliance
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {/* Add compliance nav items here */}
              </ul>
            </li>
          </ul>
        </nav>
      </Sidebar>
      <main className="flex-1">{children}</main>
    </div>
  )
}