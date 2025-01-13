"use client"

import { Header } from "@/components/header"
import { MainNav } from "@/components/main-nav"
import { SidebarProvider } from "@/components/layout/improved-sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { usePathname } from "next/navigation"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const section = pathname.split("/")[1]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <MainNav />
            <div className="flex-1 p-6 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}