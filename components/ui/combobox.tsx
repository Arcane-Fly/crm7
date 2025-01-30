import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps extends Pick<React.HTMLAttributes<HTMLDivElement>, 'id' | 'className'> {
  options: ComboboxOption[];
  value?: string | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  multiple?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  emptyMessage = 'No options found.',
  multiple = false,
}: ComboboxProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const getDisplayValue = (): string => {
    if (!value) return placeholder;

    if (multiple && Array.isArray(value)) {
      const selectedOptions = options.filter((option) => value.includes(option.value));
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} items selected`;
    }

    const option = options.find((option) => option.value === value);
    return option ? option.label : placeholder;
  };

  const isSelected = (optionValue: string): boolean => {
    if (!value) return false;
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
        >
          {getDisplayValue()}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value);
                  if (!multiple) {
                    setOpen(false);
                  }
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    isSelected(option.value) ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
