'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge'; // Import Badge component
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logger } from '@/lib/services/logger';

import styles from './styles.module.css';

export type ProgressReview = {
  id: string;
  apprenticeName: string;
  reviewDate: string;
  reviewType: 'quarterly' | 'mid-term' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  reviewer: string;
  completedUnits: number;
  totalUnits: number;
  concerns: boolean;
};

export const columns: ColumnDef<ProgressReview>[] = [
  {
    accessorKey: 'apprenticeName',
    header: 'Apprentice',
  },
  {
    accessorKey: 'reviewDate',
    header: 'Review Date',
  },
  {
    accessorKey: 'reviewType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('reviewType') as string;
      return <div className='capitalize'>{type}</div>;
    },
  },
  {
    accessorKey: 'reviewer',
    header: 'Reviewer',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const completed = row.original.completedUnits;
      const total = row.original.totalUnits;
      const percentage = (completed / total) * 100;
      const progressClass = `progress${Math.round(percentage / 10) * 10}`;
      return (
        <div className='flex items-center gap-2'>
          <div className={styles.progressBar}>
            <div className={`${styles.progressFill} ${styles[progressClass]}`} />
          </div>
          <span className='text-sm text-gray-500'>
            {completed}/{total}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'concerns',
    header: 'Concerns',
    cell: ({ row }) => {
      const concerns = row.getValue('concerns') as boolean;
      return (
        <div className={concerns ? 'text-red-600' : 'text-green-600'}>
          {concerns ? 'Yes' : 'No'}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variantMap = {
        scheduled: 'default',
        completed: 'success',
        cancelled: 'destructive', // Map 'cancelled' to 'destructive'
      } as const;

      return <Badge variant={variantMap[status as keyof typeof variantMap]}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const review = row.original;
      const isCompleted = review.status === 'completed';

      const handleViewDetails = () => {
        logger.info(
          'Viewing progress review details',
          { apprenticeName: review.apprenticeName, reviewType: review.reviewType },
          'ProgressReviewColumns',
        );
      };

      const handleCompleteReview = () => {
        if (isCompleted) return;
        logger.info(
          'Completing progress review',
          { apprenticeName: review.apprenticeName, reviewType: review.reviewType },
          'ProgressReviewColumns',
        );
      };

      const handleReschedule = () => {
        if (isCompleted) return;
        logger.info(
          'Rescheduling progress review',
          { apprenticeName: review.apprenticeName, reviewType: review.reviewType },
          'ProgressReviewColumns',
        );
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCompleteReview}
              disabled={isCompleted}
            >
              Complete Review
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReschedule}
              disabled={isCompleted}
            >
              Reschedule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
