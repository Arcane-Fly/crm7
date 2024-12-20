import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { LayoutDashboard, Users, GraduationCap, Briefcase, DollarSign, FileText, AlertTriangle, Settings } from 'lucide-react'

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Users className="mr-2 h-4 w-4" />
            Apprentices
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/apprentices"
                  >
                    <Users className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Apprentices
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Manage and view all apprentices in the system.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/apprentices/new" title="Add New Apprentice">
                Register a new apprentice in the system.
              </ListItem>
              <ListItem href="/apprentices/progress" title="Progress Tracking">
                Track the progress of apprentices through their qualifications.
              </ListItem>
              <ListItem href="/apprentices/compliance" title="Compliance Checks">
                Perform and view compliance checks for apprentices.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <GraduationCap className="mr-2 h-4 w-4" />
            Qualifications
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/qualifications"
                  >
                    <GraduationCap className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Qualifications
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Manage and view all qualifications offered.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/qualifications/new" title="Add New Qualification">
                Add a new qualification to the system.
              </ListItem>
              <ListItem href="/qualifications/units" title="Manage Units">
                Manage the units associated with each qualification.
              </ListItem>
              <ListItem href="/qualifications/reports" title="Qualification Reports">
                Generate reports on qualification progress and completion rates.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Briefcase className="mr-2 h-4 w-4" />
            Host Employers
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/host-employers"
                  >
                    <Briefcase className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Host Employers
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Manage and view all host employers in the system.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/host-employers/new" title="Add New Host Employer">
                Register a new host employer in the system.
              </ListItem>
              <ListItem href="/host-employers/placements" title="Manage Placements">
                View and manage apprentice placements with host employers.
              </ListItem>
              <ListItem href="/host-employers/compliance" title="Employer Compliance">
                Track and manage host employer compliance requirements.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <DollarSign className="mr-2 h-4 w-4" />
            Funding
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/funding"
                  >
                    <DollarSign className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Funding Management
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Manage funding programs and claims.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/funding/programs" title="Funding Programs">
                View and manage all funding programs.
              </ListItem>
              <ListItem href="/funding/claims" title="Funding Claims">
                Process and track funding claims.
              </ListItem>
              <ListItem href="/funding/reports" title="Funding Reports">
                Generate reports on funding utilization and forecasts.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/compliance" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Compliance
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

