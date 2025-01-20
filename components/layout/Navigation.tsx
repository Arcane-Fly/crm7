import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart2, 
  Database,
  Briefcase,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    label: 'Contacts',
    href: '/contacts',
    icon: <Users className="w-5 h-5" />,
    subItems: [
      { label: 'Clients', href: '/contacts/clients', icon: <Users className="w-4 h-4" /> },
      { label: 'Leads', href: '/contacts/leads', icon: <Users className="w-4 h-4" /> },
      { label: 'Vendors', href: '/contacts/vendors', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: <Calendar className="w-5 h-5" />,
    subItems: [
      { label: 'Appointments', href: '/calendar/appointments', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Tasks', href: '/calendar/tasks', icon: <Calendar className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <Briefcase className="w-5 h-5" />,
    subItems: [
      { label: 'Active', href: '/projects/active', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Completed', href: '/projects/completed', icon: <Briefcase className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: <FileText className="w-5 h-5" />,
    subItems: [
      { label: 'Contracts', href: '/documents/contracts', icon: <FileText className="w-4 h-4" /> },
      { label: 'Proposals', href: '/documents/proposals', icon: <FileText className="w-4 h-4" /> },
      { label: 'Invoices', href: '/documents/invoices', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Communication',
    href: '/communication',
    icon: <MessageSquare className="w-5 h-5" />,
    subItems: [
      { label: 'Email', href: '/communication/email', icon: <Mail className="w-4 h-4" /> },
      { label: 'SMS', href: '/communication/sms', icon: <Phone className="w-4 h-4" /> },
      { label: 'Chat', href: '/communication/chat', icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Database',
    href: '/database',
    icon: <Database className="w-5 h-5" />,
    subItems: [
      { label: 'Records', href: '/database/records', icon: <Database className="w-4 h-4" /> },
      { label: 'Reports', href: '/database/reports', icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    subItems: [
      { label: 'Profile', href: '/settings/profile', icon: <Settings className="w-4 h-4" /> },
      { label: 'Security', href: '/settings/security', icon: <Settings className="w-4 h-4" /> },
      { label: 'Preferences', href: '/settings/preferences', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export const Navigation: React.FC = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const isActive = (href: string) => router.pathname === href;
  const isActiveParent = (item: NavItem) => 
    item.subItems?.some(subItem => router.pathname.startsWith(subItem.href));

  return (
    <nav className="flex flex-col h-full bg-background border-r">
      {/* Top Navigation */}
      <div className="flex-none">
        <div className="h-16 flex items-center px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">CRM7</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <div className="relative">
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${isActive(item.href) || isActiveParent(item) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                  onClick={() => setActiveItem(activeItem === item.href ? null : item.href)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>

                {/* Sub Items */}
                {item.subItems && activeItem === item.href && (
                  <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="pl-10 mt-1 space-y-1"
                  >
                    {item.subItems.map((subItem) => (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={`
                            flex items-center px-3 py-2 rounded-md text-sm
                            ${isActive(subItem.href)
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          {subItem.icon}
                          <span className="ml-3">{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
