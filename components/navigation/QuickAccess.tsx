import { Search, Star, Clock, Plus, Bell } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickAccessItem {
  id: string;
  label: string;
  type: 'recent' | 'favorite';
  link: string;
  timestamp?: string;
}

export const QuickAccess: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentItems, _setRecentItems] = React.useState<QuickAccessItem[]>([]);
  const [favorites, _setFavorites] = React.useState<QuickAccessItem[]>([]);
  const [notifications, _setNotifications] = React.useState<number>(0);

  return (
    <div className='flex h-14 items-center space-x-4 border-b bg-background px-4'>
      {/* Global Search */}
      <div className='max-w-md flex-1'>
        <Dialog>
          <DialogTrigger asChild>
            <div className='relative'>
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search anything...'
                className='pl-10 pr-4'
                aria-label='Global search'
              />
            </div>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Global Search</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <Input
                placeholder='Type to search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full'
                autoFocus
                aria-label='Search input'
              />
              <ScrollArea className='h-[300px]'>{/* Search results would go here */}</ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Items */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='View recent items'
          >
            <Clock className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-64'
        >
          <ScrollArea className='h-[300px]'>
            {recentItems.map((item) => (
              <DropdownMenuItem key={item.id}>
                <span>{item.label}</span>
                <span className='ml-auto text-xs text-muted-foreground'>{item.timestamp}</span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Favorites */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='View favorites'
          >
            <Star className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-64'
        >
          <ScrollArea className='h-[300px]'>
            {favorites.map((item) => (
              <DropdownMenuItem key={item.id}>{item.label}</DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Create */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Quick create menu'
          >
            <Plus className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-56'
        >
          <DropdownMenuItem>New Task</DropdownMenuItem>
          <DropdownMenuItem>New Contact</DropdownMenuItem>
          <DropdownMenuItem>New Document</DropdownMenuItem>
          <DropdownMenuItem>New Project</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            aria-label={`${notifications} notifications`}
            className='relative'
          >
            <Bell className='h-5 w-5' />
            {notifications > 0 && (
              <Badge
                variant='destructive'
                className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0'
              >
                {notifications}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-80'
        >
          <ScrollArea className='h-[400px]'>{/* Notification items would go here */}</ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuickAccess;
