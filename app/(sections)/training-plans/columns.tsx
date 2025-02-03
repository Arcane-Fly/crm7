import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import styles from './training-plans.module.css';

export const columns: ColumnDef<TrainingPlan>[] = [
  // ... other columns ...
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number;
      const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';

      return (
        <div className={styles['progressBar']}>
          <div className={`${styles['progressFill']} ${styles[progressClass]}`} />
        </div>
      );
    },
  },
  // ... other columns ...
];
