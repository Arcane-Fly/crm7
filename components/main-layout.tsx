import { MainNav } from './dashboard/main-nav'
import { UserNav } from './dashboard/user-nav'
import { Search } from './dashboard/search'
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import { LayoutDashboard, Users, GraduationCap, Briefcase, DollarSign, FileText, AlertTriangle, Settings } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="hidden lg:block">
          <SidebarContent>
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Labour Hire CRM
                </h2>
                <div className="space-y-1">
                  <Button variant="secondary" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Apprentices
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Qualifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Host Employers
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Funding Programs
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Funding Claims
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Compliance
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="container flex h-16 items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <MainNav />
              </div>
              <div className="flex items-center gap-4">
                <Search />
                <UserNav />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
