# CRM7

A modern, comprehensive CRM system built with Next.js, focusing on training, safety, payroll, and HR management.

## Project Overview

CRM7 is a unified platform that combines the best features from multiple CRM systems into a single, cohesive application. It provides a robust solution for managing client relationships, employee training, safety compliance, and HR operations.

## Key Features

- **Modern Dashboard**: Real-time analytics and activity monitoring
- **Training & Development**: Course management and skill tracking
- **Safety & Compliance**: Incident reporting and compliance monitoring
- **Payroll & HR**: Award interpretation and employee management
- **Client Management**: Project tracking and communication tools

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: Supabase
- **Testing**: Vitest, React Testing Library
- **API**: REST with planned GraphQL support

## Navigation Structure

### Top-Level Sections

- Dashboard
- Training & Development
- Safety & Compliance
- Payroll & Benefits
- HR Management
- Client Management
- Project Management
- Reporting & Analytics

Each section has its own contextual sidebar with relevant subsections. For details, see [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md).

## Documentation

### Architecture & Design

- [Architecture Overview](docs/ARCHITECTURE.md)
- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md)
- [Data Models](docs/DATA_MODELS.md)
- [API Documentation](docs/API.md)

### Project Status

- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)
- [Development Roadmap](docs/ROADMAP.md)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Arcane-Fly/crm7.git
   cd crm7
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration

4. **Start development server**
   ```bash
   pnpm dev
   ```
   The application will be available at http://localhost:4500

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features

### Git Workflow

1. Create feature branch from `master`
2. Make changes and commit with conventional commits
3. Submit PR for review
4. Merge after approval

### Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Deployment

The application is configured for deployment on Vercel:

1. Connect your Vercel account to the GitHub repository
2. Configure environment variables
3. Deploy with `pnpm run build`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is private and confidential. All rights reserved.

## Support

For support, please contact the development team or create an issue in the repository.
