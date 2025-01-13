'use client'

import { Bell, Search, UserPlus, Building2, DollarSign, Calendar } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { UserNav } from './UserNav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="relative w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="w-full pl-8"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Candidate
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            New Client
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Submit Claim
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>

          <div className="ml-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}
