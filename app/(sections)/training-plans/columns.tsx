'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import styles from './styles.module.css'
import { logger } from '@/lib/services/logger'

export type TrainingPlan = {
  id: string
  apprenticeName: string
  qualification: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed'
  progress: number
  nextReview: string
}

export const columns: ColumnDef<TrainingPlan>[] = [
  {
    accessorKey: 'apprenticeName',
    header: 'Apprentice',
  },
  {
    accessorKey: 'qualification',
    header: 'Qualification',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number
      const progressClass = `progress${Math.round(progress / 10) * 10}`
      return (
        <div className={styles.progressBar}>
          <div className={`${styles.progressFill} ${styles[progressClass]}`} />
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div
          className={`capitalize ${
            status === 'active'
              ? 'text-green-600'
              : status === 'completed'
                ? 'text-blue-600'
                : 'text-yellow-600'
          }`}
        >
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: 'nextReview',
    header: 'Next Review',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const plan = row.original
      const isCompleted = plan.status === 'completed'
      const isDraft = plan.status === 'draft'

      const handleViewDetails = () => {
        logger.info(
          `Viewing training plan details`,
          {
            apprenticeName: plan.apprenticeName,
            qualification: plan.qualification,
            planId: plan.id,
          },
          'TrainingPlan'
        )
      }

      const handleEditPlan = () => {
        if (isCompleted) return
        logger.info(
          `Editing training plan`,
          {
            apprenticeName: plan.apprenticeName,
            planId: plan.id,
            status: plan.status,
          },
          'TrainingPlan'
        )
      }

      const handleScheduleReview = () => {
        if (isCompleted || isDraft) return
        logger.info(
          `Scheduling training plan review`,
          {
            apprenticeName: plan.apprenticeName,
            planId: plan.id,
            nextReview: plan.nextReview,
          },
          'TrainingPlan'
        )
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditPlan} disabled={isCompleted}>
              Edit Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleScheduleReview} disabled={isCompleted || isDraft}>
              Schedule Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
