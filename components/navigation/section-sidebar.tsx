'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const sections = {
  dashboard: [
    { title: 'Overview', href: '/dashboard' },
    { title: 'Quick Actions', href: '/dashboard/actions' },
    { title: 'Recent Activities', href: '/dashboard/activities' },
    { title: 'Notifications', href: '/dashboard/notifications' },
    { title: 'Alerts & Reminders', href: '/dashboard/alerts' },
    { title: 'Key Metrics', href: '/dashboard/metrics' },
    { title: 'Task List', href: '/dashboard/tasks' },
    { title: 'Calendar View', href: '/dashboard/calendar' },
  ],
  training: [
    { title: 'Apprentices', href: '/training/apprentices' },
    { title: 'Trainees', href: '/training/trainees' },
    { title: 'Course Catalog', href: '/training/courses' },
    { title: 'Training Calendar', href: '/training/calendar' },
    { title: 'Assessments', href: '/training/assessments' },
    { title: 'Certifications', href: '/training/certifications' },
    { title: 'Skills Matrix', href: '/training/skills' },
    { title: 'Training Records', href: '/training/records' },
  ],
  safety: [
    { title: 'Incident Reports', href: '/safety/incidents' },
    { title: 'Hazard Register', href: '/safety/hazards' },
    { title: 'Safety Audits', href: '/safety/audits' },
    { title: 'Risk Assessments', href: '/safety/risks' },
    { title: 'Safety Documents', href: '/safety/documents' },
    { title: 'PPE Management', href: '/safety/ppe' },
    { title: 'Safety Training', href: '/safety/training' },
    { title: 'Emergency Procedures', href: '/safety/emergency' },
  ],
  payroll: [
    { title: 'Payroll Processing', href: '/payroll/processing' },
    { title: 'Timesheets', href: '/payroll/timesheets' },
    { title: 'Award Rates', href: '/payroll/awards' },
    { title: 'Allowances', href: '/payroll/allowances' },
    { title: 'Deductions', href: '/payroll/deductions' },
    { title: 'Superannuation', href: '/payroll/super' },
    { title: 'Tax Management', href: '/payroll/tax' },
    { title: 'Expense Claims', href: '/payroll/expenses' },
  ],
  hr: [
    { title: 'Employees', href: '/hr/employees' },
    { title: 'Candidates', href: '/hr/candidates' },
    { title: 'Job Postings', href: '/hr/jobs' },
    { title: 'Applications', href: '/hr/applications' },
    { title: 'Onboarding', href: '/hr/onboarding' },
    { title: 'Performance', href: '/hr/performance' },
    { title: 'Leave Management', href: '/hr/leave' },
    { title: 'Documents', href: '/hr/documents' },
  ],
  compliance: [
    { title: 'Overview', href: '/compliance' },
    { title: 'Audits', href: '/compliance/audits' },
    { title: 'Certifications', href: '/compliance/certifications' },
    { title: 'Policies', href: '/compliance/policies' },
    { title: 'Risk Assessment', href: '/compliance/risk-assessment' },
    { title: 'Reports', href: '/compliance/reports' },
    { title: 'Training Records', href: '/compliance/training-records' },
    { title: 'Incidents', href: '/compliance/incidents' },
  ],
  clients: [
    { title: 'Client Directory', href: '/clients/directory' },
    { title: 'Host Employers', href: '/clients/hosts' },
    { title: 'Client Contacts', href: '/clients/contacts' },
    { title: 'Account Management', href: '/clients/accounts' },
    { title: 'Service Agreements', href: '/clients/agreements' },
    { title: 'Client Communications', href: '/clients/communications' },
    { title: 'Visit Reports', href: '/clients/visits' },
    { title: 'Client Requirements', href: '/clients/requirements' },
  ],
  marketing: [
    { title: 'Campaigns', href: '/marketing/campaigns' },
    { title: 'Lead Management', href: '/marketing/leads' },
    { title: 'Sales Pipeline', href: '/marketing/pipeline' },
    { title: 'Marketing Calendar', href: '/marketing/calendar' },
    { title: 'Email Marketing', href: '/marketing/email' },
    { title: 'Social Media', href: '/marketing/social' },
    { title: 'Website Analytics', href: '/marketing/analytics' },
    { title: 'Event Management', href: '/marketing/events' },
  ],
  reports: [
    { title: 'Standard Reports', href: '/reports/standard' },
    { title: 'Custom Reports', href: '/reports/custom' },
    { title: 'Analytics Dashboard', href: '/reports/analytics' },
    { title: 'KPI Tracking', href: '/reports/kpi' },
    { title: 'Performance Metrics', href: '/reports/performance' },
    { title: 'Financial Reports', href: '/reports/financial' },
    { title: 'Training Reports', href: '/reports/training' },
    { title: 'Safety Reports', href: '/reports/safety' },
  ],
} as const

export interface SectionSidebarProps {
  className?: string
  section?: keyof typeof sections
}

export function SectionSidebar({ className, section = 'dashboard' }: SectionSidebarProps) {
  const pathname = usePathname()
  const items = sections[section]

  return (
    <nav className={cn('flex flex-col space-y-1 p-4', className)}>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              isActive ? 'bg-accent text-accent-foreground' : 'transparent'
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}