import {
  LayoutGrid,
  Users,
  Briefcase,
  Clock,
  Shield,
  BarChart2,
  BookOpen,
  HardHat,
  Wallet,
  FileText,
  CheckCircle,
  Target,
  Calendar,
  PieChart,
  ClipboardList,
  Folder,
  Bell,
  Award,
  GraduationCap,
  LineChart,
  FileBarChart,
  UserCheck,
  DollarSign,
  FileSearch,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  slug: string;
  href: string;
  icon: LucideIcon;
  description: string;
  items?: SubNavItem[];
}

export interface SubNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    slug: 'dashboard',
    href: '/dashboard',
    icon: LayoutGrid,
    description: 'Overview and key metrics',
  },
  {
    label: 'Training & Development',
    slug: 'training',
    href: '/training',
    icon: BookOpen,
    description: 'Manage training and development programs',
  },
  {
    label: 'Safety & WHS',
    slug: 'safety',
    href: '/safety',
    icon: HardHat,
    description: 'Workplace health and safety management',
  },
  {
    label: 'Payroll & Finance',
    slug: 'payroll',
    href: '/payroll',
    icon: Wallet,
    description: 'Financial management and payroll',
  },
  {
    label: 'Human Resources',
    slug: 'hr',
    href: '/hr',
    icon: Users,
    description: 'HR management and employee records',
  },
  {
    label: 'Compliance',
    slug: 'compliance',
    href: '/compliance',
    icon: Shield,
    description: 'Compliance and regulatory management',
  },
  {
    label: 'Reports & Analytics',
    slug: 'reports',
    href: '/reports',
    icon: BarChart2,
    description: 'Reports and data analytics',
  },
] as const satisfies readonly NavItem[];

export const SECTIONS: Record<string, SubNavItem[]> = {
  dashboard: [
    { title: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { title: 'Quick Actions', href: '/dashboard/actions', icon: Briefcase },
    { title: 'Recent Activities', href: '/dashboard/activities', icon: Clock },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { title: 'Key Metrics', href: '/dashboard/metrics', icon: PieChart },
  ],
  training: [
    { title: 'Programs', href: '/training/programs', icon: GraduationCap },
    { title: 'Courses', href: '/training/courses', icon: BookOpen },
    { title: 'Progress Tracking', href: '/training/progress', icon: Target },
    { title: 'Certifications', href: '/training/certifications', icon: Award },
    { title: 'Calendar', href: '/training/calendar', icon: Calendar },
    { title: 'Reports', href: '/training/reports', icon: FileBarChart },
  ],
  safety: [
    { title: 'Incidents', href: '/safety/incidents', icon: AlertCircle },
    { title: 'Risk Assessment', href: '/safety/risk', icon: Shield },
    { title: 'Inspections', href: '/safety/inspections', icon: ClipboardList },
    { title: 'Equipment', href: '/safety/equipment', icon: HardHat },
    { title: 'Training Records', href: '/safety/training', icon: FileText },
    { title: 'Reports', href: '/safety/reports', icon: BarChart2 },
  ],
  payroll: [
    { title: 'Payrun', href: '/payroll/payrun', icon: DollarSign },
    { title: 'Timesheets', href: '/payroll/timesheets', icon: Clock },
    { title: 'Leave Management', href: '/payroll/leave', icon: Calendar },
    { title: 'Benefits', href: '/payroll/benefits', icon: Award },
    { title: 'Tax', href: '/payroll/tax', icon: FileText },
    { title: 'Reports', href: '/payroll/reports', icon: FileBarChart },
  ],
  hr: [
    { title: 'Employees', href: '/hr/employees', icon: Users },
    { title: 'Recruitment', href: '/hr/recruitment', icon: UserCheck },
    { title: 'Performance', href: '/hr/performance', icon: Target },
    { title: 'Training', href: '/hr/training', icon: GraduationCap },
    { title: 'Documents', href: '/hr/documents', icon: Folder },
    { title: 'Reports', href: '/hr/reports', icon: BarChart2 },
  ],
  compliance: [
    { title: 'Requirements', href: '/compliance/requirements', icon: CheckCircle },
    { title: 'Audits', href: '/compliance/audits', icon: FileSearch },
    { title: 'Documents', href: '/compliance/documents', icon: FileText },
    { title: 'Training', href: '/compliance/training', icon: BookOpen },
    { title: 'Incidents', href: '/compliance/incidents', icon: AlertCircle },
    { title: 'Reports', href: '/compliance/reports', icon: BarChart2 },
  ],
  reports: [
    { title: 'Standard Reports', href: '/reports/standard', icon: FileText },
    { title: 'Custom Reports', href: '/reports/custom', icon: FileBarChart },
    { title: 'Analytics', href: '/reports/analytics', icon: LineChart },
    { title: 'Dashboards', href: '/reports/dashboards', icon: PieChart },
    { title: 'Scheduled Reports', href: '/reports/scheduled', icon: Calendar },
    { title: 'Export Center', href: '/reports/export', icon: FileText },
  ],
} as const;

export type Section = keyof typeof SECTIONS;
