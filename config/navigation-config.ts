import type { LucideIcon } from 'lucide-react';
import {
  UserIcon,
  BuildingIcon,
  ShieldCheckIcon,
  DollarSignIcon,
  BarChart2Icon,
  LockIcon,
} from 'lucide-react';

export type UserRole = 'admin' | 'manager' | 'staff' | 'apprentice' | 'host';

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface CoreSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  roles: UserRole[];
  items: NavItem[];
}

export const CORE_SECTIONS: CoreSection[] = [
  {
    id: 'apprentice',
    title: 'Apprentice Management',
    icon: UserIcon,
    description: 'Manage apprentice profiles, contracts, and progress',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Profiles',
        href: '/apprentice/profiles',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Training Contracts',
        href: '/apprentice/contracts',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Progress Tracking',
        href: '/apprentice/progress',
        roles: ['admin', 'manager', 'staff', 'apprentice'],
      },
      {
        title: 'Documents',
        href: '/apprentice/documents',
        roles: ['admin', 'manager', 'staff'],
      },
    ],
  },
  {
    id: 'host',
    title: 'Host Management',
    icon: BuildingIcon,
    description: 'Manage host companies and placements',
    roles: ['admin', 'manager', 'staff'],
    items: [
      {
        title: 'Company Profiles',
        href: '/host/companies',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Placements',
        href: '/host/placements',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Safety Compliance',
        href: '/host/safety',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Financial',
        href: '/host/financial',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance System',
    icon: ShieldCheckIcon,
    description: 'Manage compliance documentation and monitoring',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Documents',
        href: '/compliance/documents',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Monitoring',
        href: '/compliance/monitoring',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Alerts',
        href: '/compliance/alerts',
        roles: ['admin', 'manager', 'staff'],
      },
      {
        title: 'Audit Trail',
        href: '/compliance/audit',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'finance',
    title: 'Financial Operations',
    icon: DollarSignIcon,
    description: 'Manage timesheets, payroll, and billing',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Timesheets',
        href: '/finance/timesheets',
        roles: ['admin', 'manager', 'staff', 'apprentice'],
      },
      {
        title: 'Payroll',
        href: '/finance/payroll',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Host Billing',
        href: '/finance/billing',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Funding',
        href: '/finance/funding',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reporting',
    icon: BarChart2Icon,
    description: 'View analytics and generate reports',
    roles: ['admin', 'manager'],
    items: [
      {
        title: 'Operational Metrics',
        href: '/analytics/operations',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Compliance Reports',
        href: '/analytics/compliance',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Financial Analytics',
        href: '/analytics/finance',
        roles: ['admin', 'manager'],
      },
      {
        title: 'Performance Tracking',
        href: '/analytics/performance',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'access',
    title: 'Access Control',
    icon: LockIcon,
    description: 'Manage system access and permissions',
    roles: ['admin'],
    items: [
      {
        title: 'Users & Roles',
        href: '/access/users',
        roles: ['admin'],
      },
      {
        title: 'Permissions',
        href: '/access/permissions',
        roles: ['admin'],
      },
      {
        title: 'Audit Log',
        href: '/access/audit',
        roles: ['admin'],
      },
    ],
  },
];
