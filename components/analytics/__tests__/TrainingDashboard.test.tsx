import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { TrainingDashboard } from '../training-dashboard'
import { useLMS } from '@/lib/hooks/use-lms'

// Mock the hooks
vi.mock('@/lib/hooks/use-lms')

const mockCourses = [
  {
    id: '1',
    title: 'Course 1',
    description: 'Test course',
    duration: 60,
    level: 'beginner',
    status: 'active',
  },
  {
    id: '2',
    title: 'Course 2',
    description: 'Another test course',
    duration: 90,
    level: 'intermediate',
    status: 'active',
  },
]

const mockEnrollments = [
  {
    id: '1',
    course_id: '1',
    status: 'completed',
    progress: 100,
    start_date: '2024-01-01',
  },
  {
    id: '2',
    course_id: '2',
    status: 'in_progress',
    progress: 50,
    start_date: '2024-01-02',
  },
]

describe('TrainingDashboard', () => {
  beforeEach(() => {
    vi.mocked(useLMS).mockReturnValue({
      courses: {
        data: mockCourses,
        isLoading: false,
        error: null,
      },
      enrollments: {
        data: mockEnrollments,
        isLoading: false,
        error: null,
      },
      actions: {
        enrollInCourse: vi.fn(),
        updateProgress: vi.fn(),
        getAssessments: vi.fn(),
      },
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
      courses: {
        data: null,
        isLoading: true,
        error: null,
      },
      enrollments: {
        data: null,
        isLoading: true,
        error: null,
      },
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
    vi.mocked(useLMS).mockReturnValue({
      courses: {
        data: null,
        isLoading: false,
        error: new Error('Failed to load courses'),
      },
      enrollments: {
        data: null,
        isLoading: false,
        error: null,
      },
      actions: {
        enrollInCourse: vi.fn(),
        updateProgress: vi.fn(),
        getAssessments: vi.fn(),
      },
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
