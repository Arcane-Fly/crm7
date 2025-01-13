'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  Clock,
  Shield,
  BarChart2,
  Settings,
  LogOut,
  FileText,
  Bell,
  Calendar,
  Activity,
  Search,
  Upload,
  MessageSquare,
  Wallet,
  FileCheck,
  Award,
  BookOpen,
  HardHat,
  AlertTriangle,
  BarChart,
  UserCog,
  Tool,
  Mail,
  CheckCircle,
  Database,
  Palette,
  LucideIcon
} from 'lucide-react'

const iconMap = {
  LayoutGrid,
  Users,
  Building2,
  Briefcase,
  Clock,
  Shield,
  BarChart2,
  Settings,
  LogOut,
  FileText,
  Bell,
  Calendar,
  Activity,
  Search,
  Upload,
  MessageSquare,
  Wallet,
  FileCheck,
  Award,
  BookOpen,
  HardHat,
  AlertTriangle,
  BarChart,
  UserCog,
  Tool,
  Mail,
  CheckCircle,
  Database,
  Palette
} as const

type IconName = keyof typeof iconMap

interface MenuItem {
  title: string
  href: string
  icon: IconName
}

interface SidebarSection {
  title: string
  items: MenuItem[]
}

const sidebarSections: Record<string, SidebarSection> = {
  '/dashboard': {
    title: 'Dashboard',
    items: [
      { title: 'High-Level Overview', href: '/dashboard/overview', icon: 'LayoutGrid' },
      { title: 'KPIs', href: '/dashboard/kpis', icon: 'Activity' },
      { title: 'Quick Stats', href: '/dashboard/stats', icon: 'BarChart' },
      { title: 'Alerts & Notifications', href: '/dashboard/alerts', icon: 'Bell' },
      { title: 'Calendar/Events', href: '/dashboard/calendar', icon: 'Calendar' },
      { title: 'Quick Actions', href: '/dashboard/actions', icon: 'Activity' },
      { title: 'Recent Activities', href: '/dashboard/activities', icon: 'Clock' },
      { title: 'Team Announcements', href: '/dashboard/announcements', icon: 'MessageSquare' }
    ]
  },
  '/candidates': {
    title: 'Candidates & Employees',
    items: [
      { title: 'Candidate/Employee List', href: '/candidates/list', icon: 'Users' },
      { title: 'Search & Filter', href: '/candidates/search', icon: 'Search' },
      { title: 'Bulk Actions', href: '/candidates/bulk-actions', icon: 'FileText' },
      { title: 'Talent Pool Management', href: '/candidates/talent-pool', icon: 'Users' },
      { title: 'Onboarding / Induction', href: '/candidates/onboarding', icon: 'FileCheck' },
      { title: 'Document Uploads', href: '/candidates/documents', icon: 'Upload' },
      { title: 'Notes & Performance', href: '/candidates/notes', icon: 'MessageSquare' },
      { title: 'Pay Rate / Classification', href: '/candidates/pay-rates', icon: 'Wallet' },
      { title: 'Apprenticeship Tracking', href: '/candidates/apprenticeships', icon: 'BookOpen' },
      { title: 'Employee Positions', href: '/candidates/positions', icon: 'Briefcase' },
      { title: 'Performance Logs', href: '/candidates/performance', icon: 'Activity' }
    ]
  },
  '/clients': {
    title: 'Clients / Host Employers',
    items: [
      { title: 'Client/Host Employer List', href: '/clients/list', icon: 'Building2' },
      { title: 'Search & Filter', href: '/clients/search', icon: 'Search' },
      { title: 'Contract/Agreements', href: '/clients/contracts', icon: 'FileText' },
      { title: 'Billing & Rates', href: '/clients/billing', icon: 'Wallet' },
      { title: 'Contact History', href: '/clients/contacts', icon: 'MessageSquare' },
      { title: 'Account Setup', href: '/clients/setup', icon: 'Tool' },
      { title: 'Communication Log', href: '/clients/communication', icon: 'MessageSquare' },
      { title: 'Historical Data', href: '/clients/history', icon: 'Clock' },
      { title: 'Credit Terms', href: '/clients/credit', icon: 'Wallet' },
      { title: 'Region Management', href: '/clients/regions', icon: 'Building2' }
    ]
  },
  '/jobs': {
    title: 'Jobs & Placements',
    items: [
      { title: 'Open Jobs Board', href: '/jobs/board', icon: 'Briefcase' },
      { title: 'View & Filter Jobs', href: '/jobs/search', icon: 'Search' },
      { title: 'Manage Job Details', href: '/jobs/details', icon: 'FileText' },
      { title: 'Candidate Shortlisting', href: '/jobs/shortlist', icon: 'Users' },
      { title: 'Placement Tracking', href: '/jobs/placements', icon: 'Activity' },
      { title: 'Job Requirements', href: '/jobs/requirements', icon: 'FileCheck' },
      { title: 'Job Applications', href: '/jobs/applications', icon: 'FileText' },
      { title: 'Completed Placements', href: '/jobs/completed', icon: 'CheckCircle' },
      { title: 'Multi-Job Actions', href: '/jobs/bulk-actions', icon: 'FileText' },
      { title: 'Roster/Shifts', href: '/jobs/roster', icon: 'Calendar' }
    ]
  },
  '/timesheets': {
    title: 'Timesheets & Payroll',
    items: [
      { title: 'Timesheet Approvals', href: '/timesheets/approvals', icon: 'FileCheck' },
      { title: 'Pending Timesheets', href: '/timesheets/pending', icon: 'Clock' },
      { title: 'Overtime & Leave', href: '/timesheets/overtime', icon: 'Clock' },
      { title: 'Fair Work Integration', href: '/timesheets/fair-work', icon: 'Award' },
      { title: 'Payroll Export', href: '/timesheets/payroll', icon: 'FileText' },
      { title: 'Pay Rate Assistant', href: '/timesheets/pay-rates', icon: 'Wallet' },
      { title: 'Payment Records', href: '/timesheets/payments', icon: 'FileText' },
      { title: 'Leave Management', href: '/timesheets/leave', icon: 'Calendar' },
      { title: 'Invoice Generation', href: '/timesheets/invoices', icon: 'FileText' },
      { title: 'Timesheet Audit', href: '/timesheets/audit', icon: 'Search' }
    ]
  },
  '/compliance': {
    title: 'Compliance & Training',
    items: [
      { title: 'Compliance & WHS Overview', href: '/compliance/overview', icon: 'Shield' },
      { title: 'Licence Tracking', href: '/compliance/licences', icon: 'FileCheck' },
      { title: 'Upcoming Expiries', href: '/compliance/expiries', icon: 'Bell' },
      { title: 'WHS Incident Reports', href: '/compliance/incidents', icon: 'AlertTriangle' },
      { title: 'Training Courses', href: '/compliance/training', icon: 'BookOpen' },
      { title: 'RTO/TAFE Progress', href: '/compliance/progress', icon: 'Activity' },
      { title: 'Assessment Results', href: '/compliance/assessments', icon: 'FileCheck' },
      { title: 'WHS Reminders', href: '/compliance/reminders', icon: 'Bell' },
      { title: 'Safety Training', href: '/compliance/safety', icon: 'HardHat' },
      { title: 'WHS Policies', href: '/compliance/policies', icon: 'FileText' }
    ]
  },
  '/reporting': {
    title: 'Reporting & Analytics',
    items: [
      { title: 'Standard Reports', href: '/reporting/standard', icon: 'FileText' },
      { title: 'Placement Success', href: '/reporting/placements', icon: 'BarChart' },
      { title: 'Timesheet Summary', href: '/reporting/timesheets', icon: 'Clock' },
      { title: 'Funding Summary', href: '/reporting/funding', icon: 'Wallet' },
      { title: 'Custom Reports', href: '/reporting/custom', icon: 'Tool' },
      { title: 'Analytics & KPIs', href: '/reporting/analytics', icon: 'BarChart' },
      { title: 'Visualization', href: '/reporting/visualization', icon: 'BarChart2' },
      { title: 'Email Reports', href: '/reporting/email', icon: 'Mail' },
      { title: 'Historical Trends', href: '/reporting/trends', icon: 'Activity' },
      { title: 'Performance KPIs', href: '/reporting/performance', icon: 'Activity' }
    ]
  },
  '/settings': {
    title: 'Settings & Admin',
    items: [
      { title: 'User Management', href: '/settings/users', icon: 'UserCog' },
      { title: 'Roles & Permissions', href: '/settings/roles', icon: 'Shield' },
      { title: 'Staff Accounts', href: '/settings/staff', icon: 'Users' },
      { title: 'Audit Logs', href: '/settings/audit', icon: 'FileText' },
      { title: 'System Settings', href: '/settings/system', icon: 'Settings' },
      { title: 'Integrations', href: '/settings/integrations', icon: 'Tool' },
      { title: 'Notifications', href: '/settings/notifications', icon: 'Bell' },
      { title: 'Feature Toggles', href: '/settings/features', icon: 'Tool' },
      { title: 'Branding', href: '/settings/branding', icon: 'Palette' },
      { title: 'Data Management', href: '/settings/data', icon: 'Database' }
    ]
  }
}

function MenuItem({ href, icon, title }: MenuItem) {
  const pathname = usePathname()
  const isActive = pathname === href
  const Icon = iconMap[icon]
  
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const section = Object.keys(sidebarSections).find(key => pathname.startsWith(key)) || '/dashboard'
  const currentSection = sidebarSections[section]

  return (
    <div className="fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r bg-white">
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {currentSection.items.map((item) => (
            <MenuItem key={item.href} {...item} />
          ))}
        </nav>
      </div>
      <div className="border-t p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
