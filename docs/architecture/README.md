# CRM7R Architecture

## Overview

A comprehensive Group Training Organisation (GTO) and labour hire CRM system that handles:

- Apprentice/Trainee Management
- Host Employer Management
- Training & Compliance
- Payroll & Funding
- Safety Management
- Reporting & Analytics

## Technical Stack

### Frontend

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for component library
- Zustand for state management (planned)
- React Query for data fetching (planned)
- Recharts for data visualization

### Backend & Auth

- Supabase for database and authentication
  - @supabase/ssr for server-side auth
  - Protected routes with middleware
  - Persistent sessions
  - Role-based access control
- Vercel Blob for file storage (planned)
- Redis for caching (planned)
- WebSocket for real-time features (planned)

### Infrastructure

- Vercel for hosting
- GitHub Actions for CI/CD
- Docker for containerization
- Jest and Vitest for testing

## Core Systems

### Navigation Structure

The application uses a three-tier navigation system:

1. Top Navigation Bar

   - User profile and settings
   - Global search
   - Notifications
   - Theme toggle

2. Main Sidebar

   - Collapsible with keyboard shortcut (Ctrl/Cmd + B)
   - Mobile responsive with slide-out menu
   - Persistent state using cookies
   - Main navigation items
   - Sign out functionality

3. Context Panel
   - Shows contextual actions and details
   - Filters and search options
   - Quick actions
   - Related information

See [Navigation Structure](./NAVIGATION.md) for the complete navigation hierarchy.

### Authentication Flow

1. Server-Side Auth

   - Protected routes with middleware
   - Server-side session validation
   - Automatic redirects
   - Cookie-based session management

2. Client-Side Auth

   - AuthProvider context
   - Real-time session updates
   - Automatic token refresh
   - Protected client routes

3. Social Auth (Planned)
   - Google authentication
   - Microsoft authentication
   - Single sign-on

### Integration Points

#### Government Systems

- Fair Work API for award interpretation
- Training.gov.au for qualification frameworks
- Government funding portals
- Apprenticeship Network Providers

#### Training Systems

- RTO Management Systems
- Learning Management Systems
- Competency Tracking
- Assessment Tools

#### Safety & Compliance

- WHS/OHS Systems
- Incident Reporting
- Risk Management
- Compliance Monitoring

#### Financial Systems

- Payroll Processing
- Funding Claims
- Invoice Generation
- Expense Management

### AI Integration (Planned)

- LLM for award interpretation
- Predictive analytics for completion rates
- Automated compliance checking
- Smart document processing

### Security

- Role-based access control
- JWT authentication with SSR
- OAuth2 integration (planned)
- Multi-factor authentication (planned)
- Audit logging

## Module Details

### Apprentice Management

- Profile Management
- Progress Tracking
- Placement History
- Compliance Status
- Training Records

### Host Employer Management

- Company Profiles
- Agreement Management
- Placement Management
- Risk Assessment
- Communication Tools

### Training Management

- Course Catalog
- Progress Tracking
- Assessment Management
- Certification
- Compliance Monitoring

### Payroll & Finance

- Award Interpretation
- Timesheet Management
- Payment Processing
- Funding Claims
- Financial Reporting

### Reporting & Analytics

- Standard Reports
- Custom Report Builder
- Data Visualization
- Export Options
- Scheduled Reports
