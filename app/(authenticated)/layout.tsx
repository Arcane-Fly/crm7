"use client"

import { Header } from "@/components/header"
import { MainNav } from "@/components/main-nav"
import { SectionSidebar } from "@/components/navigation/section-sidebar"
import { usePathname } from "next/navigation"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const section = pathname.split("/")[1]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <SectionSidebar 
          className="w-64 border-r hidden md:block" 
          section={section} 
        />
        <main className="flex-1 flex flex-col">
          <MainNav />
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}