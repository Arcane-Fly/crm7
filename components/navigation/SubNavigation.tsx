import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
        { id: 'quick-view', label: 'Quick View', href: '/dashboard/quick-view', ariaLabel: 'View dashboard overview' },
        { id: 'metrics', label: 'Key Metrics', href: '/dashboard/metrics', ariaLabel: 'View key metrics' },
      ],
    },
    {
      id: 'activities',
      label: 'Activities',
      items: [
        { id: 'recent', label: 'Recent Activities', href: '/dashboard/recent', ariaLabel: 'View recent activities' },
        { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications', ariaLabel: 'View notifications' },
      ],
    },
  ],
  training: [
    {
      id: 'programs',
      label: 'Programs',
      items: [
        { id: 'apprentices', label: 'Apprentices', href: '/training/apprentices', ariaLabel: 'Manage apprentices' },
        { id: 'trainees', label: 'Trainees', href: '/training/trainees', ariaLabel: 'Manage trainees' },
        { id: 'courses', label: 'Course Catalog', href: '/training/courses', ariaLabel: 'View course catalog' },
      ],
    },
    {
      id: 'tracking',
      label: 'Tracking',
      items: [
        { id: 'assessments', label: 'Assessments', href: '/training/assessments', ariaLabel: 'View assessments' },
        { id: 'certifications', label: 'Certifications', href: '/training/certifications', ariaLabel: 'Manage certifications' },
        { id: 'competencies', label: 'Competency Tracking', href: '/training/competencies', ariaLabel: 'Track competencies' },
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
      className="w-64 border-r bg-background h-full"
      aria-label={`${section} Navigation`}
    >
      <ScrollArea className="h-full">
        <div className="p-4">
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-4"
          >
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-none"
              >
                <AccordionTrigger
                  className="py-2 px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                >
                  {section.label}
                </AccordionTrigger>
                <AccordionContent>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pl-4 space-y-1"
                  >
                    {section.items.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 text-sm",
                          isActive(item.href) && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => router.push(item.href)}
                        aria-label={item.ariaLabel}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        <ChevronRight className="h-4 w-4" />
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
