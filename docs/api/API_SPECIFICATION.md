# API Specification

## Authentication

### OAuth2 Flow

```typescript
interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
```

## Core APIs

### Employee Management

```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  jobTitle: string;
  department: string;
  startDate: string;
  employmentType: 'permanent' | 'casual' | 'contractor';
  status: 'active' | 'terminated' | 'on_leave';
  personalDetails: {
    dateOfBirth: string;
    gender?: string;
    address: Address;
    contact: ContactInfo;
  };
  employmentDetails: {
    baseRate: number;
    rateUnit: 'hourly' | 'annually';
    costCenter: string;
    manager: string;
    location: string;
  };
}
```

### Training Management

```typescript
interface TrainingPlan {
  id: string;
  employeeId: string;
  qualificationCode: string;
  startDate: string;
  expectedEndDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  units: Array<{
    code: string;
    name: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completionDate?: string;
  }>;
  assessments: Array<{
    id: string;
    type: 'practical' | 'theory' | 'workplace';
    status: 'scheduled' | 'completed' | 'failed';
    date?: string;
    assessor?: string;
  }>;
}
```

### Payroll Integration

```typescript
interface PayrollData {
  employeeId: string;
  payPeriod: {
    startDate: string;
    endDate: string;
    processDate: string;
  };
  earnings: Array<{
    type: string;
    amount: number;
    hours?: number;
    rate?: number;
  }>;
  deductions: Array<{
    type: string;
    amount: number;
    preTax: boolean;
  }>;
  tax: {
    amount: number;
    taxScale: string;
  };
  superannuation: {
    amount: number;
    fund: string;
    memberNumber: string;
  };
}
```

### Leave Management

```typescript
interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'long_service' | 'unpaid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  hours: number;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
  approver?: string;
  comments?: string[];
}
```

### Document Management

```typescript
interface Document {
  id: string;
  type: 'contract' | 'policy' | 'certificate' | 'other';
  title: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  content: {
    url: string;
    mimeType: string;
    size: number;
  };
  metadata: {
    createdAt: string;
    createdBy: string;
    tags: string[];
    expiryDate?: string;
  };
  permissions: Array<{
    role: string;
    access: 'read' | 'write' | 'admin';
  }>;
}
```

## Integration APIs

### Fair Work Integration

```typescript
interface AwardInterpretation {
  awardCode: string;
  classification: string;
  employmentType: string;
  date: string;
  calculation: {
    baseRate: number;
    casualLoading?: number;
    penalties: Array<{
      type: string;
      rate: number;
      amount: number;
    }>;
    allowances: Array<{
      type: string;
      amount: number;
    }>;
    total: number;
  };
}
```

### Compliance Reporting

```typescript
interface ComplianceReport {
  type: 'award' | 'superannuation' | 'tax' | 'training';
  period: {
    start: string;
    end: string;
  };
  status: 'compliant' | 'non_compliant' | 'review_required';
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    description: string;
    remediation: string;
  }>;
  metrics: {
    totalChecked: number;
    issuesFound: number;
    complianceRate: number;
  };
}
```

## Webhook Events

### Event Types

```typescript
type WebhookEvent =
  | 'employee.created'
  | 'employee.updated'
  | 'leave.requested'
  | 'leave.approved'
  | 'training.completed'
  | 'document.uploaded'
  | 'compliance.alert';

interface WebhookPayload<T> {
  eventId: string;
  eventType: WebhookEvent;
  timestamp: string;
  data: T;
}
```

## Error Handling

### Error Types

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

## Rate Limiting

### Limits

```typescript
interface RateLimit {
  endpoint: string;
  method: string;
  limit: number;
  window: number;
  remaining: number;
  reset: number;
}
```

## Versioning

### Version Headers

```typescript
interface VersionHeader {
  'API-Version': string;
  'Accept-Version': string;
}
```
