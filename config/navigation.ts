import type { LucideIcon } from 'lucide-react';
import {
  BarChart3Icon,
  BriefcaseIcon,
  CogIcon,
  FileTextIcon,
  GaugeIcon,
  HomeIcon,
  LayersIcon,
  LineChartIcon,
  UsersIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  slug?: string;
  label?: string;
  children?: NavItem[];
}

export interface Section {
  title: string;
  items: NavItem[];
}

export const MAIN_NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    slug: 'dashboard',
    label: 'Dashboard',
  },
  {
    title: 'Candidates',
    href: '/candidates',
    icon: UsersIcon,
    slug: 'candidates',
    label: 'Candidates',
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: BriefcaseIcon,
    slug: 'clients',
    label: 'Clients',
  },
  {
    title: 'Jobs & Placements',
    href: '/jobs',
    icon: LayersIcon,
    slug: 'jobs',
    label: 'Jobs',
  },
  {
    title: 'Funding & Incentives',
    href: '/funding',
    icon: BarChart3Icon,
    slug: 'funding',
    label: 'Funding',
  },
  {
    title: 'Training & Compliance',
    href: '/training',
    icon: FileTextIcon,
    slug: 'training',
    label: 'Training',
  },
  {
    title: 'Timesheets & Payroll',
    href: '/timesheets',
    icon: GaugeIcon,
    slug: 'timesheets',
    label: 'Timesheets',
  },
  {
    title: 'Reporting & Analytics',
    href: '/reporting',
    icon: LineChartIcon,
    slug: 'reporting',
    label: 'Reports',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: CogIcon,
    slug: 'settings',
    label: 'Settings',
  },
];

export const SECTIONS: Record<string, NavItem[]> = {
  rates: [
    { title: 'Calculator', href: '/rates/calculator', label: 'Calculator' },
    { title: 'Templates', href: '/rates/templates', label: 'Templates' },
    { title: 'Bulk', href: '/rates/bulk', label: 'Bulk' },
  ],
};
