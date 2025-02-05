'use client';

import {
  LayoutDashboard
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Sidebar({ className, children, ...props }: SidebarProps): JSX.Element {
  return (
    <div className={cn('hidden border-r bg-background lg:block lg:w-64 lg:flex-none', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Labour Hire CRM</h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            {/* ... other buttons ... */}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
