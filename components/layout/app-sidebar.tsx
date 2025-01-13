'use client'

import { Clock, Users, Building2, LayoutDashboard, ClipboardCheck, MessageSquare, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./improved-sidebar"

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
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    router.push("/auth")
  }

  return (
    <Sidebar>
      <nav className="flex flex-col space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.title}
          </Link>
        ))}
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start px-3 py-2"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </nav>
    </Sidebar>
  )
}
