# Getting Started with CRM7

This guide will help you set up CRM7 for local development.

## Prerequisites

### Required Software

- Node.js ^18.17.0
- PNPM ^9.0.0
- Git
- VS Code (recommended)

### Accounts Needed

- Supabase Account
- Auth0 Account
- GitHub Account

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Arcane-Fly/crm7.git
cd crm7
```

### 2. Install Dependencies

```bash
# Install pnpm if not already installed
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Install project dependencies
pnpm install
```

### 3. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Configure the following variables in `.env.local`:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

   # Auth0 Configuration
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=http://localhost:4200
   AUTH0_ISSUER_BASE_URL=your_auth0_domain
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   ```

### 4. Database Setup

1. Create a new Supabase project
2. Run the initial migrations:

   ```bash
   pnpm supabase:migrate
   ```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at <http://localhost:4200>

## Development Workflow

### Code Style

We use ESLint and Prettier for code formatting. VS Code is configured to format on save.

```bash
# Check code style
pnpm lint

# Fix code style issues
pnpm lint:fix

# Format code
pnpm format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Type Checking

```bash
# Run type checker
pnpm type-check
```

## Project Structure

```
crm7/
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── analytics/    # Analytics components
│   └── rates/        # Rate calculation components
├── lib/              # Core libraries
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Business logic services
│   └── types/        # TypeScript types
├── pages/            # Next.js pages
│   ├── api/          # API routes
│   └── app/          # App routes
├── public/           # Static assets
├── styles/           # Global styles
└── tests/            # Test suites
    ├── e2e/          # End-to-end tests
    └── unit/         # Unit tests
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm deploy` - Deploy to production
- `pnpm type-check` - Run TypeScript compiler

## Common Issues

### 1. Port Already in Use

```bash
# Kill process using port 4200
lsof -i :4200
kill -9 <PID>
```

### 2. Environment Variables

If you're getting environment variable errors:

1. Ensure `.env.local` exists
2. Check all required variables are set
3. Restart the development server

### 3. Type Errors

If you're getting TypeScript errors:

1. Run `pnpm type-check`
2. Ensure all dependencies are installed
3. Check for missing type definitions

## Next Steps

1. Review the [Architecture Overview](ARCHITECTURE.md)
2. Read the [Contributing Guidelines](CONTRIBUTING.md)
3. Check the [Technical Assessment](TECHNICAL_ASSESSMENT.md)

## Getting Help

- Check the [documentation](../docs)
- Open an issue on GitHub
- Contact the development team

## Contributing

See our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style
- Pull request process
- Development workflow
- Testing requirements

---

Last Updated: 2025-01-22
