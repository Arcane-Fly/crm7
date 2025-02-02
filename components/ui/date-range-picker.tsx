'use client';

import { format, isEqual } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange) => void;
}

export function DatePickerWithRange({ className, date, onDateChange }: DatePickerWithRangeProps): void {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(date: unknown);

  React.useEffect(() => {
    // Use deep equality check to prevent infinite loops
    if (
      date &&
      (!dateRange ||
        (date.from && dateRange.from && !isEqual(date.from, dateRange.from)) ||
        (date.to && dateRange.to && !isEqual(date.to, dateRange.to)))
    ) {
      setDateRange(date: unknown);
    }
  }, [date, dateRange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant='outline'
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {dateRange.from && format(dateRange.from, 'LLL dd, y')} -{' '}
                  {dateRange.to && format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                dateRange.from && format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
        >
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(newDateRange: unknown) => {
              setDateRange(newDateRange: unknown);
              onDateChange?.(newDateRange || { from: undefined, to: undefined });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
