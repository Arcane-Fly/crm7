import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/index';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SubNavItem {
  id: string;
  label: string;
  href: string;
  ariaLabel: string;
  icon?: React.ReactNode;
}

interface SubNavSection {
  id: string;
  label: string;
  items: SubNavItem[];
}

interface SubNavigationProps {
  section: string;
}

const subNavSections: Record<string, SubNavSection[]> = {
  dashboard: [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        {
          id: 'quick-view',
          label: 'Quick View',
          href: '/dashboard/quick-view',
          ariaLabel: 'View dashboard overview',
        },
        {
          id: 'metrics',
          label: 'Key Metrics',
          href: '/dashboard/metrics',
          ariaLabel: 'View key metrics',
        },
      ],
    },
    {
      id: 'activities',
      label: 'Activities',
      items: [
        {
          id: 'recent',
          label: 'Recent Activities',
          href: '/dashboard/recent',
          ariaLabel: 'View recent activities',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          href: '/dashboard/notifications',
          ariaLabel: 'View notifications',
        },
      ],
    },
  ],
  training: [
    {
      id: 'programs',
      label: 'Programs',
      items: [
        {
          id: 'apprentices',
          label: 'Apprentices',
          href: '/training/apprentices',
          ariaLabel: 'Manage apprentices',
        },
        {
          id: 'trainees',
          label: 'Trainees',
          href: '/training/trainees',
          ariaLabel: 'Manage trainees',
        },
        {
          id: 'courses',
          label: 'Course Catalog',
          href: '/training/courses',
          ariaLabel: 'View course catalog',
        },
      ],
    },
    {
      id: 'tracking',
      label: 'Tracking',
      items: [
        {
          id: 'assessments',
          label: 'Assessments',
          href: '/training/assessments',
          ariaLabel: 'View assessments',
        },
        {
          id: 'certifications',
          label: 'Certifications',
          href: '/training/certifications',
          ariaLabel: 'Manage certifications',
        },
        {
          id: 'competencies',
          label: 'Competency Tracking',
          href: '/training/competencies',
          ariaLabel: 'Track competencies',
        },
      ],
    },
  ],
  // Add other sections as needed
};

export const SubNavigation: React.FC<SubNavigationProps> = ({ section }) => {
  const router = useRouter();
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const isActive = (href: string) => router.pathname === href;

  const sections = subNavSections[section] || [];

  return (
    <nav
      className='h-full w-64 border-r bg-background'
      aria-label={`${section} Navigation`}
    >
      <ScrollArea className='h-full'>
        <div className='p-4'>
          <Accordion
            type='multiple'
            value={openSections}
            onValueChange={setOpenSections}
            className='space-y-4'
          >
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className='border-none'
              >
                <AccordionTrigger className='rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'>
                  {section.label}
                </AccordionTrigger>
                <AccordionContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='space-y-1 pl-4'
                  >
                    {section.items.map((item) => (
                      <Button
                        key={item.id}
                        variant='ghost'
                        className={cn(
                          'w-full justify-start gap-2 text-sm',
                          isActive(item.href) && 'bg-accent text-accent-foreground',
                        )}
                        onClick={() => router.push(item.href)}
                        aria-label={item.ariaLabel}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <ChevronRight className='h-4 w-4' />
                        {item.label}
                      </Button>
                    ))}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </nav>
  );
};

export default SubNavigation;
