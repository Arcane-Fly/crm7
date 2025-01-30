import { Menu } from 'lucide-react';
import { type ReactElement } from 'react';

// UI Components
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/ui/user-nav';

// Hooks
import { useSidebarContext } from '@/lib/hooks/use-sidebar-context';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className = '' }: AppHeaderProps): ReactElement {
  const { toggleSidebar } = useSidebarContext();

  return (
    <header className={className}>
      <div className='flex h-16 items-center px-4'>
        <Button
          variant='ghost'
          className='h-8 w-8 p-0'
          onClick={toggleSidebar}
        >
          <Menu className='h-6 w-6' />
        </Button>
        <div className='ml-auto flex items-center space-x-4'>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
