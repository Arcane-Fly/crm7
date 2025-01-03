# CRM7 Architecture

## Navigation Structure

### Top-Level Sections
The application uses a top navigation bar for major functional areas:

- Dashboard (Home)
- Training & Development
- Safety & Compliance
- Payroll & Benefits
- HR Management
- Client Management
- Project Management
- Reporting & Analytics

### Sidebar Navigation
Each top-level section has its own contextual sidebar with relevant subsections:

#### Training & Development
- Course Catalog
- Training Records
- Certifications
- Skills Matrix
- Development Plans
- Training Calendar
- Assessment Tools

#### Safety & Compliance
- Safety Policies
- Incident Reports
- Compliance Training
- Audit Logs
- Risk Assessments
- Safety Metrics
- Documentation

#### Payroll & Benefits
- Payroll Processing
- Benefits Administration
- Time & Attendance
- Leave Management
- Expense Claims
- Tax Documents
- Compensation

#### HR Management
- Employee Records
- Recruitment
- Performance Reviews
- Onboarding
- Offboarding
- Policy Documents
- Employee Relations

## Technical Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for component library
- Zustand for state management
- React Query for data fetching
- Recharts for data visualization

### Testing
- Vitest for unit testing
- React Testing Library for component testing
- Jest for integration testing
- Cypress for E2E testing (planned)

### API Integration
- REST API endpoints
- GraphQL integration (planned)
- WebSocket for real-time updates (planned)

### Authentication & Authorization
- Role-based access control
- JWT authentication
- OAuth2 integration (planned)

### Data Storage
- Supabase for database
- Vercel Blob for file storage
- Redis for caching (planned)