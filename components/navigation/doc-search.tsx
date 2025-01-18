'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

export function DocSearch() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant='outline'
        className='relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64'
        onClick={() => setOpen(true)}
      >
        <Search className='mr-2 h-4 w-4' />
        <span className='hidden lg:inline-flex'>Search documentation...</span>
        <span className='inline-flex lg:hidden'>Search...</span>
        <kbd className='pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Type to search...' />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading='Documentation'>
            <CommandItem>API Reference</CommandItem>
            <CommandItem>Getting Started</CommandItem>
            <CommandItem>Deployment Guide</CommandItem>
          </CommandGroup>
          <CommandGroup heading='Components'>
            <CommandItem>Navigation</CommandItem>
            <CommandItem>Forms</CommandItem>
            <CommandItem>Tables</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
