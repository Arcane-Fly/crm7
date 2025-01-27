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

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  multiple?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  multiple = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  React.useEffect(() => {
    setSelected(Array.isArray(value) ? value : value ? [value] : []);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    if (multiple) {
      const newSelected = selected.includes(currentValue)
        ? selected.filter((item) => item !== currentValue)
        : [...selected, currentValue];
      setSelected(newSelected);
      onChange(currentValue);
    } else {
      setSelected([currentValue]);
      onChange(currentValue);
      setOpen(false);
    }
  };

  const selectedLabels = selected
    .map((s) => options.find((option) => option.value === s)?.label)
    .filter(Boolean)
    .join(', ');

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
          {selectedLabels || placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.includes(option.value) ? 'opacity-100' : 'opacity-0',
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
