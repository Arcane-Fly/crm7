import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PostgrestErrorType } from '@/types/test-utils'
import { fireEvent } from '@testing-library/react'
import { TrainingDashboard } from '../training-dashboard'
import { useLMS } from '@/lib/hooks/use-lms'
import { createMockQueryResult } from '@/types/test-utils'
import type { Course, Enrollment } from '@/lib/types/lms'

// Mock the hooks
vi.mock('@/lib/hooks/use-lms')

const mockCourses: Course[] = [
  {
    id: '1',
    org_id: 'org1',
    title: 'Test Course',
    description: 'Test Description',
    duration: 60,
    level: 'beginner',
    status: 'active',
    instructor: 'Test Instructor',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
]

const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    org_id: 'org1',
    course_id: '1',
    user_id: 'user1',
    student_id: 'student1',
    status: 'active',
    progress: 50,
    start_date: '2025-01-01',
    created_at: '2025-01-01',
    updated_at: '2025-01-01'
  }
]

describe('TrainingDashboard', () => {
  beforeEach(() => {
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult<Course[]>({
        data: mockCourses,
        isLoading: false,
        error: null,
      }),
      enrollments: createMockQueryResult<Enrollment[]>({
        data: mockEnrollments,
        isLoading: false,
        error: null,
      }),
      actions: {
        enrollInCourse: vi.fn(),
        updateProgress: vi.fn(),
        getAssessments: vi.fn(),
      }
    })
  })

  it('renders without crashing', () => {
    render(<TrainingDashboard />)
    expect(screen.getByText('Training Analytics')).toBeInTheDocument()
  })

  it('displays correct statistics', () => {
    render(<TrainingDashboard />)
    expect(screen.getByText('2')).toBeInTheDocument() // Total Enrollments
    expect(screen.getByText('1')).toBeInTheDocument() // Completed
    expect(screen.getByText('1')).toBeInTheDocument() // In Progress
    expect(screen.getByText('50.0%')).toBeInTheDocument() // Completion Rate
  })

  it('shows loading state', () => {
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult<Course[]>({
        data: undefined,
        isLoading: true,
        error: null,
      }),
      enrollments: createMockQueryResult<Enrollment[]>({
        data: undefined,
        isLoading: true,
        error: null,
      }),
      actions: {
        enrollInCourse: vi.fn(),
        updateProgress: vi.fn(),
        getAssessments: vi.fn(),
      },
    })

    render(<TrainingDashboard />)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('shows error state', () => {
    const mockError = new Error('Failed to load courses')
    
    vi.mocked(useLMS).mockReturnValue({
      courses: createMockQueryResult<Course[]>({
        data: [],
        isLoading: false,
        error: new PostgrestErrorType('Failed to load courses'),
      }),
      enrollments: createMockQueryResult<Enrollment[]>({
        data: [],
        isLoading: false,
        error: null,
      }),
      createCourse: vi.fn(),
      updateCourse: vi.fn(), 
      deleteCourse: vi.fn(),
      createEnrollment: vi.fn(),
      updateEnrollment: vi.fn(),
      deleteEnrollment: vi.fn(),
      isCreatingCourse: false,
      isUpdatingCourse: false,
      isDeletingCourse: false,
      isCreatingEnrollment: false,
      isUpdatingEnrollment: false
    })

    render(<TrainingDashboard />)
    expect(screen.getByText(/Failed to load courses/i)).toBeInTheDocument()
  })

  it('filters data by date range', async () => {
    render(<TrainingDashboard />)

    // Open date picker
    const dateRangePicker = screen.getByRole('button', { name: /Date Range/i })
    fireEvent.click(dateRangePicker)

    // Select date range
    // Note: Actual date selection would depend on your date picker component
    // This is just a simplified example

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
