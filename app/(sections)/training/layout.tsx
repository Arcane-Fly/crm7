import React from 'react';
import Link from 'next/link';
import { type ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  items?: NavItem[];
}

interface NavSection {
  items: NavItem[];
}

const TRAINING_NAV: Record<string, NavSection> = {
  Overview: {
    items: [
      { href: '/training', label: 'Dashboard' },
      { href: '/training/reports', label: 'Reports' },
    ],
  },
  Management: {
    items: [
      { href: '/training/courses', label: 'Courses' },
      { href: '/training/assessments', label: 'Assessments' },
      { href: '/training/certifications', label: 'Certifications' },
    ],
  },
};

export default function TrainingLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 border-r bg-background">
        {Object.entries(TRAINING_NAV).map(([section, { items }]) => (
          <div key={section} className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">{section}</h2>
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block rounded-md px-8 py-2 text-sm font-medium hover:bg-accent"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
