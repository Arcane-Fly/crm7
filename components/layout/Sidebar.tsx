import { useState } from 'react';
import { type SidebarSection } from '@/lib/types';

interface SidebarProps {
  sections: Record<string, SidebarSection[]>;
  pathname: string;
}

export function Sidebar({ sections, pathname }: SidebarProps): React.ReactElement {
  const section = Object.keys(sections).find((key) => pathname?.startsWith(key) ?? false);

  return (
    <div className="h-screen w-64 border-r bg-background">
      {/* Sidebar implementation */}
    </div>
  );
}
