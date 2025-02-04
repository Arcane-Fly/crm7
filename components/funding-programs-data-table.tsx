import { Badge } from '@/components/ui/badge';
import { type FundingProgram } from '@/lib/types';

const getStatusVariant = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'secondary';
    default:
      return 'default';
  }
};

export function FundingProgramsDataTable(): JSX.Element {
  return (
    <div>
      {/* Table implementation */}
      <Badge variant={getStatusVariant(status)}>{String(status)}</Badge>
    </div>
  );
}
