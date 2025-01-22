### Type Safety Requirements

1. Component Props:

   - Use strict null checks
   - Define explicit return types
   - Validate all API responses
   - Handle loading and error states

2. API Integration:
   - Type all API responses
   - Use Zod for runtime validation
   - Handle null/undefined properly
   - Type guard external data

### Rate Calculation Types

1. Status Management:

   - Use enums for all status values
   - Include all possible states (active, inactive, draft, etc.)
   - Track status history with timestamps
   - Include user attribution for changes

2. Template Versioning:

   - Track effective date ranges
   - Maintain history of changes
   - Include approval workflow states
   - Store metadata for auditing

3. Rate Components:
   - Base rate and margin
   - Superannuation rate
   - Leave loading rate
   - Workers compensation rate
   - Payroll tax rate
   - Training cost rate
   - Other costs rate
   - Funding offset
   - Track all rate adjustments

### Rate Calculation Rules:

- All rates must be decimal percentages (0-1)
- Base rate is in dollars
- Funding offset can be negative
- All rates must be versioned with effective dates
- Store full calculation history

4. History Tracking:

   - Record all status changes
   - Track who made changes
   - Store change reasons
   - Keep audit notes:

1. Status Management:

   - Use enums for all status values
   - Include all possible states (active, inactive, draft, etc.)
   - Track status history with timestamps
   - Include user attribution for changes

1. Template Versioning:

   - Track effective date ranges
   - Maintain history of changes
   - Include approval workflow states
   - Store metadata for auditing

1. Calculation Components:

   - Break down all cost components
   - Include base and final rates
   - Track adjustments and offsets
   - Store calculation metadata 4. Testing Requirements:

     1. React Query Testing:

        - Use createMockQueryResult helper for consistent mocks
        - Include all required states (isLoading, isError, etc.)
        - Match database schema exactly in mock data
        - Use PostgrestErrorType for error states

     2. Mock Data Creation:

        ```typescript
        const mockQuery = createMockQueryResult({
          data: mockData,
          isLoading: false,
          error: null,
        })
        ```

     3. Test Data Types:
        - Include all required fields from schema
        - Use proper enums and types
        - Add realistic sample data
        - Match database constraints

### Next.js Specific:

- Always handle usePathname() null case with ?? '/'
- Type test data to match database schema exactly
- Use proper module augmentation for API routes
- Keep test utilities in types/test-utils.d.ts

### React Query Patterns:

- Return complete hook interface including loading/error states
- Type mutations with proper Omit<T> for create/update operations
- Provide default empty arrays for collection queries
- Combine loading/error states from multiple queries### Type Safety with React Query:
   - Use QueryResult<T> type for query results
   - Type mutation parameters explicitly
   - Handle loading and error states properly
   - Provide default values for undefined data

### Testing Requirements:
   1. React Query Testing:
      - Use createMockQueryResult helper for consistent mocks
      - Include all required states (isLoading, isError, etc.)
      - Match database schema exactly in mock data
      - Use PostgrestErrorType for error states
      - Handle undefined data states properly
      - Use proper type constraints for generic hooks

   2. Hook Usage:
      - Destructure and rename hook results to avoid naming conflicts
      - Provide default values for undefined data
      - Type hook parameters explicitly
      - Handle loading and error states consistently

   2. Mock Data Creation:
      ```typescript
      const mockQuery = createMockQueryResult({
        data: mockData,
        isLoading: false,
        error: null
      });
      ```

   3. Test Data Types:
      - Include all required fields from schema
      - Use proper enums and types
      - Add realistic sample data
      - Match database constraints### Module Resolution:
   - Use path aliases (@/*)
   - Maintain barrel exports
   - Keep types directory in sync
   - Verify module declarations
   - Import types from their source files
   - Use consistent import paths across codebase
   - Prefer importing from type definition files
   - Keep import paths relative to project root

### Database Query Configuration:
   - Use select to specify columns
   - Use order array for sorting
   - Specify ascending/descending explicitly
   - Include all required fields in select
   - Handle null values with coalescing
   - Always include queryKey for cache management
   - Use consistent key format across queries
   - Include relevant parameters in queryKey
   - Invalidate related queries on mutations
   - Handle stale data with proper cache time

### Type Organization:
   - Split complex types into base and extended interfaces
   - Keep related types in the same file
   - Export all public types
   - Use consistent naming conventions
   - Document type constraints and relationships

### Hook Interface Design:
   - Include all possible states (loading, error, etc.)
   - Make optional methods explicit with undefined union
   - Group related operations under a single interface
   - Document async operation states
   - Include refresh/refetch capabilities

### Testing Requirements:
   1. React Query Testing:
      - Use createMockQueryResult helper for consistent mocks
      - Include all required states (isLoading, isError, etc.)
      - Match database schema exactly in mock data
      - Use PostgrestErrorType for error states
      - Handle undefined data states properly
      - Use proper type constraints for generic hooks

   2. Hook Usage:
      - Destructure and rename hook results to avoid naming conflicts
      - Provide default values for undefined data
      - Type hook parameters explicitly
      - Handle loading and error states consistently

### Hook Types:
   - Use QueryResult type for all async data
   - Export hook interface with implementation
   - Type query parameters with table names
   - Handle loading and error states consistently
   - Provide default values for undefined data

### Module Export Requirements:
   - Export interfaces alongside their implementations
   - Use named exports for components and hooks
   - Keep type exports in sync with implementations
   - Verify all imports have corresponding exports

### API Patterns:
   - Use separate parameters for id and data in update operations
   - Keep mutation parameters simple and explicit
   - Avoid nested objects in API calls
   - Use consistent parameter ordering (id first, then data)

### Type Safety:
   - Use literal types for string enums (e.g., 'credit' | 'debit')
   - Export default for single-component files
   - Import test utilities from shared test utils
   - Use consistent boolean flags (is_active vs status)
   - Make optional fields explicit with undefined union
   - Implement proper error types extending Error
   - Ensure test mocks match interface contracts
   - Use strict null checks for all fields
   - Use optional chaining (?.) with null coalescing (??) for safe navigation
   - Export interfaces alongside their implementations
   - Keep props interface with component

### Banking Integration:
   - Use BSB for Australian bank accounts (routing number equivalent)
   - Enforce strict transaction types ('credit' | 'debit')
   - Require reference numbers for all transactions
   - Handle bank account status with is_active flag
   - Use QueryResult type for all async bank data

### Form Handling:
   - Add org_id from current user context
   - Set sensible defaults for required fields
   - Use strict types for status fields
   - Handle dates in ISO format
   - Destructure and rename hook results to avoid naming conflicts

### Hook Design:
   - Export hook result interface with hook
   - Return complete hook interface including loading/error states
   - Type mutations with proper Omit<T> for create/update operations
   - Provide default empty arrays for collection queries
   - Combine loading/error states from multiple queries
   - Type parameters and return values explicitly
   - Handle undefined states with null coalescing
   - Use type guards for narrowing
   - Maintain consistent naming conventions
   - Document complex type relationships

### Component Organization:
   - Keep UI primitives in components/ui directory
   - Use barrel exports for component collections
   - Maintain consistent file structure across components
   - Group related components in subdirectories
   - Export component interfaces alongside components### Next.js Client Components:
   - Add 'use client' directive to client components
   - Handle null cases from hooks like usePathname with null coalescing (??)
   - Use optional chaining (?.) with null coalescing for safe navigation
   - Export components as named exports
   - Keep props interface with component

### Project Status Documentation:

- Track completion percentages with specific metrics
- Document technical challenges and solutions
- Include quantifiable metrics (performance, coverage, etc.)
- Link status updates to business value
- Track resource allocation and capacity
- Maintain risk register with mitigation strategies
- Document dependencies and blockers

### Version Management:

- Use .nvmrc for Node.js version control
- Specify both Node.js and package manager versions in package.json
- Keep engines field up to date with project requirements
- Document version constraints in deployment guides
- Test with the exact versions specified in CI/CD
