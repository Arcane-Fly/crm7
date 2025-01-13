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
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for component library
- Zustand for state management
- React Query for data fetching
- Recharts for data visualization

### Backend
- Supabase for database and authentication
- Vercel Blob for file storage
- Redis for caching (planned)
- WebSocket for real-time features

### Infrastructure
- Vercel for hosting
- GitHub Actions for CI/CD
- Docker for containerization
- Jest and Vitest for testing

## Core Systems

### Navigation Structure
The application uses a dual-panel navigation system:

1. Top Navigation Bar
			- Provides access to major functional areas (Dashboard, Training, Safety, etc.)
			- Focuses on broad business functions
			- Maintains context across the application

2. Left Side Panel
			- Shows contextual subcategories based on selected top navigation
			- Provides detailed access to specific features
			- Enables quick navigation within each functional area

See [Navigation Structure](./NAVIGATION.md) for the complete navigation hierarchy.

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

### AI Integration
- LLM for award interpretation
- Predictive analytics for completion rates
- Automated compliance checking
- Smart document processing

### Security
- Role-based access control
- JWT authentication
- OAuth2 integration
- Multi-factor authentication
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
- Placement Tracking
- Agreement Management
- Compliance Requirements
- Communication Logs

### Training & Compliance
- Course Management
- Progress Tracking
- Certification Management
- Compliance Monitoring
- Risk Assessment

### Payroll & Funding
- Award Interpretation
- Timesheet Processing
- Funding Claims
- Payment Processing
- Expense Management

### Reporting
- Standard Reports
- Custom Report Builder
- Analytics Dashboard
- Export Capabilities
- Scheduled Reports

## Data Flow

### 1. Data Collection
- Web Forms
- File Uploads
- API Integrations
- Automated Imports

### 2. Processing
- Validation
- Enrichment
- Classification
- Analysis

### 3. Storage
- Structured Data (Supabase)
- File Storage (Vercel Blob)
- Caching (Redis planned)
- Audit Logs

### 4. Presentation
- Web Interface
- API Endpoints
- Export Formats
- Real-time Updates

## Development Guidelines

### Code Organization
- Feature-based structure
- Shared components
- Type-safe interfaces
- Modular architecture

### Testing Strategy
- Unit Tests (Vitest)
- Integration Tests (Jest)
- E2E Tests (Cypress planned)
- Performance Testing

### Deployment
- CI/CD Pipeline
- Environment Management
- Version Control
- Release Process

### Monitoring
- Error Tracking
- Performance Metrics
- Usage Analytics
- Security Monitoring

## Implementation Status

### Core Features
- Authentication & Authorization ✅
- Data Management System ✅
- Real-time Sync ⚠️
- Document Management ⚠️

### UI Components
- Design System ✅
- Shared Components ✅
- Responsive Layouts ✅
- Accessibility ✅

### Modules
- Apprentice Management ✅
- Host Employer Management ⚠️
- Training & Compliance ⚠️
- Payroll & Funding ⚠️
- Reporting & Analytics ✅

## Future Roadmap

### Phase 1 (Current)
- Complete chat interface enhancements
- Implement bulk operations
- Enhance document management
- Fix critical bugs
- Complete core integrations

### Phase 2 (Next Quarter)
- Advanced reporting features
- Enhanced compliance monitoring
- Improved data visualization
- Mobile responsiveness
- Performance optimization

### Phase 3 (Future)
- Mobile Application
- Offline Capabilities
- Advanced Analytics
- Machine Learning Integration
- Extended API Access

## Technical Debt

### Code Quality
- Unit test coverage < 80%
- E2E tests needed
- Performance optimization
- Documentation updates

### Infrastructure
- CI/CD improvements
- Monitoring setup
- Error tracking
- Load testing

### Security
- Security audit
- GDPR compliance
- Rate limiting
- Session management