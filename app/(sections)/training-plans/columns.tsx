'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logger } from '@/lib/services/logger';

import styles from './styles.module.css';

export type TrainingPlan = {
  id: string;
  apprenticeName: string;
  qualification: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  progress: number;
  nextReview: string;
};

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
    cell: ({ row }: { row: { getValue: (key: string) => number } }): ReactNode => {
      const progress = row.getValue('progress');
      const progressClass = `progress${Math.round(progress / 10) * 10}`;
      return (
        <div className={styles.progressBar}>
          <div className={`${styles.progressFill} ${styles[progressClass]}`} />
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { getValue: (key: string) => TrainingPlan['status'] } }): ReactNode => {
      const status = row.getValue('status');
      const variantMap = {
        active: 'default',
        completed: 'success',
        draft: 'warning',
      } as const;

      return <Badge variant={variantMap[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'nextReview',
    header: 'Next Review',
  },
  {
    id: 'actions',
    cell: ({ row }: { row: { original: TrainingPlan } }): ReactNode => {
      const plan = row.original;
      const isCompleted = plan.status === 'completed';
      const isDraft = plan.status === 'draft';

      const handleViewDetails = (): void => {
        logger.info(
          'Viewing training plan details',
          {
            apprenticeName: plan.apprenticeName,
            qualification: plan.qualification,
            planId: plan.id,
          },
          'TrainingPlan',
        );
      };

      const handleEditPlan = (): void => {
        if (isCompleted: unknown) return;
        logger.info(
          'Editing training plan',
          {
            apprenticeName: plan.apprenticeName,
            planId: plan.id,
            status: plan.status,
          },
          'TrainingPlan',
        );
      };

      const handleScheduleReview = (): void => {
        if (isCompleted || isDraft) return;
        logger.info(
          'Scheduling training plan review',
          {
            apprenticeName: plan.apprenticeName,
            planId: plan.id,
            nextReview: plan.nextReview,
          },
          'TrainingPlan',
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
              onClick={handleEditPlan}
              disabled={isCompleted}
            >
              Edit Plan
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleScheduleReview}
              disabled={isCompleted || isDraft}
            >
              Schedule Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
