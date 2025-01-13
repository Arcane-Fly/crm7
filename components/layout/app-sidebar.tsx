'use client'

import { Clock, Users, Building2, LayoutDashboard, ClipboardCheck, MessageSquare, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarHeader, SidebarTrigger } from "./improved-sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Timesheets",
    icon: Clock,
    path: "/timesheets",
  },
  {
    title: "Employees",
    icon: Users,
    path: "/employees",
  },
  {
    title: "Clients",
    icon: Building2,
    path: "/clients",
  },
  {
    title: "Approvals",
    icon: ClipboardCheck,
    path: "/approvals",
  },
  {
    title: "Chat",
    icon: MessageSquare,
    path: "/chat",
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      })
    } else {
      router.push("/auth")
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">WorkforceHub</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <div className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            className="w-full justify-start gap-2"
            asChild
          >
            <Link href={item.path}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </Button>
        ))}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-100"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </Sidebar>
  )
}
