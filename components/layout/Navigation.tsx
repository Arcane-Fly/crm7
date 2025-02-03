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
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

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
    icon: <BarChart2 className='h-5 w-5' />,
  },
  {
    label: 'Contacts',
    href: '/contacts',
    icon: <Users className='h-5 w-5' />,
    subItems: [
      { label: 'Clients', href: '/contacts/clients', icon: <Users className='h-4 w-4' /> },
      { label: 'Leads', href: '/contacts/leads', icon: <Users className='h-4 w-4' /> },
      { label: 'Vendors', href: '/contacts/vendors', icon: <Users className='h-4 w-4' /> },
    ],
  },
  // ... additional nav items
];

export const Navigation: React.FC = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  const isActive = (href: string) => router.pathname === href;
  const isActiveParent = (item: NavItem) =>
    item.subItems?.some((subItem: NavItem) => router.pathname.startsWith(subItem.href)) || false;

  return (
    <nav className='flex h-full flex-col border-r bg-background'>
      {/* Top Navigation */}
      <div className='flex-none'>
        <div className='flex h-16 items-center px-4'>
          <Link href='/dashboard' className='flex items-center space-x-2'>
            <span className='text-xl font-bold'>CRM7</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className='flex-1 overflow-y-auto py-4'>
        <ul className='space-y-1 px-2'>
          {mainNavItems.map((item: NavItem) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(item.href) || isActiveParent(item)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setActiveItem(activeItem === item.href ? null : item.href)}
              >
                {item.icon}
                <span className='ml-3'>{item.label}</span>
              </Link>
              {item.subItems && (
                <ul className='mt-1 space-y-1 pl-8'>
                  {item.subItems.map((subItem: NavItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`flex items-center rounded-md px-3 py-2 text-sm ${
                          isActive(subItem.href)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {subItem.icon}
                        <span className='ml-3'>{subItem.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
