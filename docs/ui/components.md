# UI Components & Interactions

## Core Components

### Data Management Components

#### DataTable

```typescript
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchFields: (keyof T)[]
  filterOptions: Record<string, { value: string; label: string }[]>
  initialFilters: Record<string, string>
  filterFn: (item: T, filters: Record<string, string>) => boolean
  onRowClick?: (item: T) => void
  isLoading?: boolean
  error?: string
  searchPlaceholder?: string
}
```

Source: crm3, enhanced with features from crm4

#### ColumnCustomizer

```typescript
interface ColumnCustomizerProps<T> {
  columns: Column<T>[]
  visibleColumns: string[]
  onColumnChange: (columns: string[]) => void
}
```

Source: crm4, with enhanced UI from crm7

### Apprentice Management Components

#### CompetencyMatrix

```typescript
interface CompetencyUnit {
  code: string
  title: string
  status: 'completed' | 'in_progress' | 'not_started'
  dueDate?: string
  completionDate?: string
}

interface CompetencyMatrixProps {
  apprenticeId: string
  units: CompetencyUnit[]
  onStatusChange: (unitCode: string, status: string) => void
}
```

Source: crm4, with real-time updates from crm7

### Document Management

#### DocumentUpload

```typescript
interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>
  allowedTypes: string[]
  maxSize: number
  multiple?: boolean
}
```

Source: crm7, with enhanced validation from crm3

## Interaction Patterns

### Form Handling

- Real-time validation
- Autosave functionality
- Error messaging
- Field dependencies
- Loading states

### Data Loading

- Skeleton loaders
- Error boundaries
- Retry mechanisms
- Pagination
- Infinite scroll

### Notifications

- Toast messages
- Alert dialogs
- Progress indicators
- Status updates

### Navigation

- Breadcrumbs
- Context menus
- Quick actions
- Search functionality

## State Management

### Context Providers

#### PayRateChat Context

```typescript
interface PayRateChatState {
  messages: ChatMessage[]
  isLoading: boolean
  selectedAward?: Award
  selectedClassification?: Classification
  error?: string
}

interface PayRateChatContext {
  state: PayRateChatState
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
}
```

Source: crm4, enhanced with features from crm3

#### Toast Context

```typescript
interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

interface ToastContext {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}
```

Source: crm3, with enhanced styling from crm7

## Hooks

### Data Fetching

#### useCompetencyMatrix

```typescript
function useCompetencyMatrix(apprenticeId: string) {
  return {
    units: CompetencyUnit[];
    isLoading: boolean;
    fetchUnits: () => Promise<void>;
  };
}
```

Source: crm4

#### useDocuments

```typescript
interface UseDocumentsOptions {
  type?: string;
  isTemplate?: boolean;
  search?: string;
}

function useDocuments(options?: UseDocumentsOptions) {
  return {
    documents: Document[];
    isLoading: boolean;
    error?: Error;
  };
}
```

Source: crm4, with enhanced search from crm7

## Styling

### Theme System

- Light/dark mode support
- Custom color schemes
- Typography system
- Spacing system
- Component variants

### Layout Components

- Responsive grid
- Flex containers
- Card layouts
- Form layouts
- Table layouts

## Accessibility

### Standards

- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

### Responsive Design

- Mobile-first approach
- Breakpoint system
- Fluid typography
- Flexible layouts
- Touch targets

## Performance

### Optimization

- Code splitting
- Lazy loading
- Image optimization
- Bundle size management
- Cache strategies

### Monitoring

- Performance metrics
- Error tracking
- Usage analytics
- Load time monitoring
- Interaction tracking
