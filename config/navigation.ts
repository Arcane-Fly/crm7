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
// Remove unused import

export interface NavItem {
  title: string;
  href?: string;
  icon?: any; // Using any for now as the LucideIcon type is complex
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
    title: 'Rates',
    href: '/rates',
    icon: LineChartIcon,
    slug: 'rates',
    label: 'Rates',
    children: [
      {
        title: 'Rate Calculator',
        href: '/rates/calculator',
        label: 'Calculator',
      },
      {
        title: 'Rate Templates',
        href: '/rates/templates',
        label: 'Templates',
      },
      {
        title: 'Bulk Operations',
        href: '/rates/bulk',
        label: 'Bulk',
      },
    ],
  },
  {
    title: 'Awards',
    href: '/awards',
    icon: BriefcaseIcon,
    slug: 'awards',
    label: 'Awards',
  },
  {
    title: 'Compliance',
    href: '/compliance-logs',
    icon: FileTextIcon,
    slug: 'compliance',
    label: 'Compliance',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3Icon,
    slug: 'analytics',
    label: 'Analytics',
    children: [
      {
        title: 'Training Dashboard',
        href: '/analytics/training',
        label: 'Training',
      },
      {
        title: 'HR Dashboard',
        href: '/analytics/hr',
        label: 'HR',
      },
    ],
  },
  {
    title: 'System',
    icon: CogIcon,
    slug: 'system',
    label: 'System',
    children: [
      {
        title: 'Monitoring',
        href: '/monitoring',
        icon: GaugeIcon,
        label: 'Monitoring',
      },
      {
        title: 'Enterprise Agreements',
        href: '/enterprise-agreements',
        icon: LayersIcon,
        label: 'Agreements',
      },
      {
        title: 'User Management',
        href: '/users',
        icon: UsersIcon,
        label: 'Users',
      },
    ],
  },
];

export const SECTIONS: Record<string, NavItem[]> = {
  rates: [
    { title: 'Calculator', href: '/rates/calculator', label: 'Calculator' },
    { title: 'Templates', href: '/rates/templates', label: 'Templates' },
    { title: 'Bulk', href: '/rates/bulk', label: 'Bulk' },
  ],
};
