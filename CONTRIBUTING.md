# Contributing to CRM7

## Navigation Structure

CRM7 uses a dual-navigation system with top-level sections and contextual sidebars.

### Top-Level Navigation

```
app/
├── (dashboard)/       # Main dashboard
├── training/         # Training & Development
├── safety/          # Safety & Compliance
├── payroll/         # Payroll & Benefits
├── hr/              # HR Management
├── clients/         # Client Management
├── projects/        # Project Management
└── reporting/       # Analytics & Reports
```

Each top-level section represents a complete business domain. When adding new sections:

1. Create a new directory in `app/`
2. Add a `layout.tsx` for section-specific layouts
3. Include error boundaries and loading states
4. Update the main navigation component

### Sidebar Navigation

Each top-level section has its own contextual sidebar. Implement sidebars using:

```typescript
interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  items?: SidebarItem[];
}

// Example implementation
const TrainingSidebar = () => {
  const items: SidebarItem[] = [
    {
      label: "Courses",
      href: "/training/courses",
      items: [
        { label: "Catalog", href: "/training/courses/catalog" },
        { label: "Management", href: "/training/courses/management" }
      ]
    }
  ];

  return <SidebarNav items={items} />;
};
```

## Development Workflow

### Getting Started

1. Clone and Setup

```bash
git clone https://github.com/Arcane-Fly/crm7.git
cd crm7
pnpm install
pnpm dev
```

2. Branch Naming

```
feature/[feature-name]
bugfix/[bug-name]
hotfix/[hotfix-name]
```

### Component Structure

1. Page Components

```typescript
// app/[section]/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title - CRM7',
  description: 'Page description'
};

export default function Page() {
  return (
    <div className="space-y-4 p-8">
      <PageHeader />
      <MainContent />
    </div>
  );
}
```

2. Layout Components

```typescript
// app/[section]/layout.tsx
import { SectionSidebar } from '@/components/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SectionSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Testing

1. Run Tests

```bash
pnpm test            # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
```

2. Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Pull Request Process

1. Create a new branch
2. Make your changes
3. Update documentation
4. Add tests
5. Submit PR using template:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Description of testing performed

## Screenshots

If applicable, add screenshots
```

## Style Guide

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Document complex types
- Use proper type imports

### Components

- Use functional components
- Implement proper error boundaries
- Include loading states
- Follow accessibility guidelines

### CSS/Tailwind

- Use utility classes
- Follow color scheme
- Maintain responsive design
- Use CSS variables for theming

## Documentation

Update relevant documentation:

- README.md for project-wide changes
- API.md for endpoint changes
- DATA_MODELS.md for data structure changes
- UI_UX_GUIDELINES.md for UI changes
- IMPLEMENTATION_STATUS.md for feature status

## Getting Help

1. Check existing documentation
2. Search closed issues
3. Ask in team chat
4. Create new issue

## Code Review Checklist

- [ ] Type safety
- [ ] Error handling
- [ ] Performance
- [ ] Documentation
- [ ] Test coverage
- [ ] Accessibility
- [ ] Mobile responsiveness
- [ ] Navigation structure
- [ ] Route handling
