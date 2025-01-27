import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  DollarSign,
  Users,
  Building2,
  Target,
  ClipboardCheck,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  ariaLabel: string;
}

const mainNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className='h-5 w-5' />,
    href: '/dashboard',
    ariaLabel: 'Navigate to Dashboard',
  },
  {
    id: 'training',
    label: 'Training & Development',
    icon: <GraduationCap className='h-5 w-5' />,
    href: '/training',
    ariaLabel: 'Navigate to Training and Development',
  },
  {
    id: 'safety',
    label: 'Safety & WHS',
    icon: <ShieldCheck className='h-5 w-5' />,
    href: '/safety',
    ariaLabel: 'Navigate to Safety and WHS',
  },
  {
    id: 'payroll',
    label: 'Payroll & Finance',
    icon: <DollarSign className='h-5 w-5' />,
    href: '/payroll',
    ariaLabel: 'Navigate to Payroll and Finance',
  },
  {
    id: 'hr',
    label: 'Human Resources',
    icon: <Users className='h-5 w-5' />,
    href: '/hr',
    ariaLabel: 'Navigate to Human Resources',
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: <Building2 className='h-5 w-5' />,
    href: '/clients',
    ariaLabel: 'Navigate to Client Management',
  },
  {
    id: 'marketing',
    label: 'Marketing & Sales',
    icon: <Target className='h-5 w-5' />,
    href: '/marketing',
    ariaLabel: 'Navigate to Marketing and Sales',
  },
  {
    id: 'compliance',
    label: 'Compliance & Quality',
    icon: <ClipboardCheck className='h-5 w-5' />,
    href: '/compliance',
    ariaLabel: 'Navigate to Compliance and Quality',
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <BarChart2 className='h-5 w-5' />,
    href: '/reports',
    ariaLabel: 'Navigate to Reports and Analytics',
  },
];

export const MainNavigation: React.FC = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const isActive = (href: string) => router.pathname.startsWith(href);

  return (
    <TooltipProvider>
      <nav
        className='h-full border-r bg-background'
        aria-label='Main Navigation'
      >
        <ScrollArea className='h-full'>
          <div className='space-y-4 py-4'>
            {mainNavItems.map((item) => (
              <div
                key={item.id}
                className='px-3'
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive(item.href) && 'bg-secondary',
                      )}
                      onClick={() => {
                        router.push(item.href);
                        setActiveSection(item.id);
                      }}
                      aria-label={item.ariaLabel}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {item.icon}
                      <span className='flex-1 text-left'>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === item.id && 'rotate-180',
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p>{item.ariaLabel}</p>
                  </TooltipContent>
                </Tooltip>

                {activeSection === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='mt-2 space-y-1 pl-12'
                  >
                    {/* Subcategories will be rendered here */}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </nav>
    </TooltipProvider>
  );
};

export default MainNavigation;
