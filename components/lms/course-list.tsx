import { type Course } from '@/lib/types';

interface CourseListProps {
  courses: Course[];
  onUpdate: () => void;
}

export function CourseList({ courses, onUpdate }: CourseListProps): React.ReactElement {
  const handleDeactivate = async (courseId: string): Promise<void> => {
    try {
      await updateCourse(courseId, { status: 'inactive' });
      onUpdate();
    } catch (error) {
      console.error('Failed to deactivate course:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Course list implementation */}
    </div>
  );
}
