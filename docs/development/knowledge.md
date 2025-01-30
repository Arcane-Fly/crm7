### Type Safety Requirements

1. Naming Conventions:

   - Use camelCase for props (e.g., orgId not org_id)
   - Be consistent with type names across the codebase
   - Remove unused imports and variables
   - Mark unused variables with underscore prefix

2. React Component Props:

   - Remove unused props from function parameters
   - Use proper typing for Supabase query results:
     - Use table name as generic parameter: useSupabaseQuery<'tableName'>
     - Use Database type for row types: Database['public']['Tables']['tableName']['Row']
     - Check migration files for correct table names
     - Avoid using raw types directly in generic parameter
     - Let Supabase infer the return type from the table name
   - Cast unknown types explicitly when mapping over query results
   - Use 'void' operator for promise-returning event handlers

3. Testing Requirements:

   - Mock data should match the exact shape of the real data
   - For React Query mocks:
     - Use createMockQueryResult helper for consistent mocks
     - Only provide basic properties to createMockQueryResult:
       - data: The query result data
       - isLoading: Loading state boolean
       - error: Error object or null
     - Let createMockQueryResult handle:
       - Status flags (isError, isPending, etc.)
       - Functions (refetch)
       - Status strings (status, fetchStatus)
     - Never mock internal properties like dataUpdatedAt
     - Avoid duplicating properties in mock objects
     - Remove unused mock variables
   - Use vi.fn() for mock functions
   - Keep mock data structure aligned with actual API responses

4. Type Safety with API Responses:

   - Define interfaces for API responses before using them
   - Use type assertions only when response shape is guaranteed
   - Cast unknown API responses to defined interfaces
   - Keep response types close to where they're used
   - Use Promise<SpecificType> for async function returns
   - When validating request bodies:
     - Use unknown type for initial body parameter
     - Validate required fields before type casting
     - Convert field values explicitly (String(), Number())
     - Set default values for optional fields
     - Include user context fields (createdBy, updatedBy)
   - When using Supabase:
     - Add table names to TableName type in use-supabase-query.ts
     - Use Database type to infer row types
     - Keep table names in sync with migrations
     - Define response interfaces for non-Supabase API calls
     - For tables not in TableName type:
       - Use raw query with useQuery hook from @tanstack/react-query
       - Type the response using Database type
       - Handle errors explicitly
       - Use queryKey that matches table name
   - For service interfaces:
     - Export shared types from service files
     - Define status enums for state management
     - Use discriminated unions for complex responses
     - Keep response shapes consistent across related endpoints
     - When updating response types:
       - Add all required fields to interfaces
       - Use snake_case for API responses
       - Use camelCase for client-side code
       - Document expected values and formats

5. Pathname Handling:

   - Always use optional chaining with usePathname()
   - Provide fallback for null cases (pathname?.startsWith() ?? false)
   - Type pathname as string | null

6. Component Props:

   - Use explicit return type React.ReactElement
   - Define interface for all props
   - Mark optional props with ?
   - Use type-only imports for types

7. Import Organization:

   - Use type-only imports for types (import type { Type } from 'module')
   - Group imports by: React/Next, external, internal
   - Add empty line between import groups
   - When verbatimModuleSyntax is enabled in tsconfig.json:
     - All type imports must use 'import type'
     - Common examples: Metadata, Database, ErrorInfo, FallbackProps
     - No mixing of type and value imports from same module

8. Component Props:

   - Use strict null checks
   - Define explicit return types
   - Validate all API responses
   - Handle loading and error states

9. API Integration:
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
        });
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

1.  React Query Testing:

    - Use createMockQueryResult helper for consistent mocks
    - Include all required states (isLoading, isError, etc.)
    - Match database schema exactly in mock data
    - Use PostgrestErrorType for error states
    - Handle undefined data states properly
    - Use proper type constraints for generic hooks

2.  Hook Usage:

    - Destructure and rename hook results to avoid naming conflicts
    - Provide default values for undefined data
    - Type hook parameters explicitly
    - Handle loading and error states consistently

3.  Mock Data Creation:

    ```typescript
    const mockQuery = createMockQueryResult({
      data: mockData,
      isLoading: false,
      error: null,
    });
    ```

4.  Test Data Types:
    - Include all required fields from schema
    - Use proper enums and types
    - Add realistic sample data
    - Match database constraints### Module Resolution:

- Use path aliases (@/\*)
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

1.  React Query Testing:

    - Use createMockQueryResult helper for consistent mocks
    - Include all required states (isLoading, isError, etc.)
    - Match database schema exactly in mock data
    - Use PostgrestErrorType for error states
    - Handle undefined data states properly
    - Use proper type constraints for generic hooks

2.  Hook Usage:
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

### TypeScript Configuration:

- Set target to es2015 or higher for modern JavaScript features
- Required for:
  - Spread operator with Sets
  - Optional chaining
  - Nullish coalescing
  - Modern array methods
