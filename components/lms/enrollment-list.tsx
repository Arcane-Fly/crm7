import { type Enrollment } from '@/lib/types';

interface EnrollmentListProps {
  enrollments: Enrollment[];
  onUpdate: () => void;
}

export function EnrollmentList({ enrollments, onUpdate }: EnrollmentListProps): React.ReactElement {
  const handleUnenroll = async (enrollmentId: string): Promise<void> => {
    try {
      await deleteEnrollment(enrollmentId);
      onUpdate();
    } catch (error) {
      console.error('Failed to unenroll:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enrollment list implementation */}
    </div>
  );
}
