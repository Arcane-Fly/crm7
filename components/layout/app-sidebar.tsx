'use client'

import { 
  Clock, 
  Users, 
  Building2, 
  LayoutDashboard, 
  ClipboardCheck, 
  MessageSquare, 
  LogOut,
  GraduationCap,
  Briefcase,
  FileText,
  BookOpen,
  Award,
  UserCheck,
  Building
} from "lucide-react"
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
    title: "Apprentices",
    icon: GraduationCap,
    path: "/apprentices",
  },
  {
    title: "Host Employers",
    icon: Building,
    path: "/host-employers",
  },
  {
    title: "Training Plans",
    icon: BookOpen,
    path: "/training-plans",
  },
  {
    title: "Qualifications",
    icon: Award,
    path: "/qualifications",
  },
  {
    title: "Placements",
    icon: Briefcase,
    path: "/placements",
  },
  {
    title: "Progress Reviews",
    icon: UserCheck,
    path: "/progress-reviews",
  },
  {
    title: "Compliance",
    icon: ClipboardCheck,
    path: "/compliance",
  },
  {
    title: "Documents",
    icon: FileText,
    path: "/documents",
  },
  {
    title: "Timesheets",
    icon: Clock,
    path: "/timesheets",
  },
  {
    title: "Staff",
    icon: Users,
    path: "/staff",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    path: "/messages",
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
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <nav className="flex flex-col space-y-1 p-2">
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
          </nav>
        </div>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-start px-3 py-2"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Sidebar>
  )
}
