# UI/UX Guidelines

## Navigation Structure

### Top Navigation Panels
The application uses a top navigation bar for major functional areas, each representing a complete business domain:

1. **Dashboard**
   - Overview and quick access to key features
   - Real-time alerts and notifications
   - Key performance indicators

2. **Training & Development**
   - Course management
   - Skills tracking
   - Certifications
   - Learning paths

3. **Safety & Compliance**
   - Incident reporting
   - Safety documentation
   - Compliance tracking
   - Risk assessments

4. **Payroll & HR**
   - Payroll processing
   - Benefits management
   - Employee records
   - Leave management

5. **Client Management**
   - Client records
   - Project tracking
   - Contract management
   - Communication tools

### Left Sidebar Navigation
Each top-level section has its own contextual sidebar with relevant subsections:

#### Training & Development Sidebar
- Course Catalog
- Training Records
- Certifications
- Skills Matrix
- Development Plans
- Training Calendar
- Assessment Tools

#### Safety & Compliance Sidebar
- Safety Policies
- Incident Reports
- Compliance Training
- Audit Logs
- Risk Assessments
- Safety Metrics
- Documentation

#### Payroll & HR Sidebar
- Payroll Processing
- Benefits Administration
- Time & Attendance
- Leave Management
- Expense Claims
- Tax Documents
- Employee Records

#### Client Management Sidebar
- Client Directory
- Projects
- Contracts
- Communications
- Documents
- Billing
- Reports

## Component Guidelines

### Dashboard Components
- **Stats Cards**
  - Consistent height and width
  - Clear numerical display
  - Trend indicators
  - Clickable for details

- **Charts**
  - Interactive tooltips
  - Legend positioning
  - Consistent color scheme
  - Responsive sizing

- **Tables**
  - Column customization
  - Bulk actions
  - Advanced filtering
  - Export options
  - Pagination controls

### Interactive Elements

#### Forms
- Consistent validation feedback
- Real-time validation
- Autosave functionality
- Clear error messages
- Progress indicators
- Responsive layouts

#### Buttons
- Primary actions: Solid fill
- Secondary actions: Outline style
- Destructive actions: Red variants
- Loading states
- Disabled states

#### Modals & Dialogs
- Centered positioning
- Clear headers
- Action buttons alignment
- Escape key dismissal
- Background overlay

## Status Indicators

### Alert Types
```typescript
type AlertStatus = 'success' | 'warning' | 'error' | 'info';
```

### Progress States
```typescript
type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
```

## Layout Guidelines

### Grid System
- 12-column layout
- Responsive breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Spacing
- Base unit: 4px
- Common spacing values:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px

## Color Palette

### Primary Colors
```css
--primary: hsl(222.2, 47.4%, 11.2%);
--primary-foreground: hsl(210, 40%, 98%);
```

### Secondary Colors
```css
--secondary: hsl(210, 40%, 96.1%);
--secondary-foreground: hsl(222.2, 47.4%, 11.2%);
```

### Accent Colors
```css
--accent: hsl(210, 40%, 96.1%);
--accent-foreground: hsl(222.2, 47.4%, 11.2%);
```

### Status Colors
```css
--success: hsl(143, 85%, 96%);
--warning: hsl(48, 96%, 89%);
--error: hsl(0, 84.2%, 60.2%);
--info: hsl(210, 40%, 98%);
```

## Typography

### Font Family
```css
--font-sans: "Inter", sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
```

## Accessibility Guidelines

### Focus States
- Visible focus indicators
- Skip navigation links
- Keyboard navigation support
- ARIA labels and roles

### Color Contrast
- Minimum contrast ratio: 4.5:1
- Large text contrast ratio: 3:1
- Interactive elements: 3:1

## Performance Guidelines

### Loading States
- Skeleton loaders
- Progress indicators
- Lazy loading
- Infinite scroll thresholds

### Interaction Feedback
- Button press states
- Form submission feedback
- Error handling
- Success confirmations

## Known Issues & Improvements

### High Priority
1. Chat Interface
   - Implement real-time sync
   - Add message status indicators
   - Improve file handling

2. Data Management
   - Add bulk actions
   - Implement column customization
   - Enhance export options

### Medium Priority
1. Form Improvements
   - Standardize validation
   - Add autosave functionality
   - Enhance error messaging

2. Reporting Features
   - Custom report builder
   - Enhanced export options
   - Scheduled reports

### Low Priority
1. Document Management
   - File preview system
   - Version control
   - Batch processing