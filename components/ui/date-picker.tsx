'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type ReactElement } from 'react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: Date;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ selected, onSelect, className }: DatePickerProps): ReactElement {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selected ? format(selected: unknown, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0'
        align='start'
      >
        <Calendar
          mode='single'
          selected={selected}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
