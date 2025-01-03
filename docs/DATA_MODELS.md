# CRM7 Data Models

## Core Data Models

### Employee Data
```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  hireDate: string;
  permissions: string[];
  awards: Award[];
  classifications: Classification[];
  allowances: WageAllowance[];
}
```

### Award System Models

#### Award
```typescript
interface Award {
  award_fixed_id: number;
  award_id: number;
  award_operative_from: Date;
  award_operative_to?: Date;
  code: string;
  name: string;
  published_year: number;
  version_number: number;
  last_modified_datetime: Date;
}
```

#### Classification
```typescript
interface Classification {
  award_fixed_id: number;
  classification_fixed_id: number;
  classification: string;
  classification_level: number;
  base_pay_rate_id?: string;
  base_rate?: number;
  base_rate_type?: 'Weekly' | 'Hourly' | 'Annual' | 'Daily' | 'Piece rate';
  calculated_rate?: number;
  calculated_rate_type?: 'Hourly' | 'Weekly' | 'Annual' | 'Daily' | 'Fortnightly' | 'Casual Hourly';
  operative_from: Date;
  operative_to?: Date;
  employee_rate_type_code?: 'AD' | 'JN' | 'AP' | 'AA' | 'TN' | 'XT' | 'CA';
  parent_classification_name?: string;
}
```

#### Allowances
```typescript
interface WageAllowance {
  allowance: string;
  allowance_amount?: number;
  award_fixed_id: number;
  base_pay_rate_id: number;
  is_all_purpose: boolean;
  payment_frequency?: string;
  rate?: number;
  rate_unit?: string;
  operative_from: Date;
  operative_to?: Date;
}

interface ExpenseAllowance {
  allowance: string;
  allowance_amount?: number;
  award_fixed_id: number;
  is_all_purpose: boolean;
  payment_frequency: string;
  cpi_quarter_last_adjusted?: string;
  last_adjusted_year?: number;
  operative_from: Date;
  operative_to?: Date;
}
```

#### Penalty Rates
```typescript
interface Penalty {
  penalty_fixed_id: number;
  award_fixed_id: number;
  penalty_description: string;
  rate?: number;
  penalty_calculated_value?: number;
  employee_rate_type_code?: 'AD' | 'JN' | 'AP' | 'AA' | 'TN' | 'XT' | 'CA';
  operative_from: Date;
  operative_to?: Date;
}
```

## Training & Development Models

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  type: 'mandatory' | 'optional' | 'certification';
  duration: number;
  validityPeriod?: number;
  prerequisites?: string[];
  materials: CourseMaterial[];
  status: 'active' | 'archived';
}
```

### Training Record
```typescript
interface TrainingRecord {
  id: string;
  employeeId: string;
  courseId: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired';
  startDate: Date;
  completionDate?: Date;
  expiryDate?: Date;
  score?: number;
  certificationId?: string;
  assessorId?: string;
}
```

## Safety & Compliance Models

### Incident Report
```typescript
interface IncidentReport {
  id: string;
  reporterId: string;
  type: 'injury' | 'near_miss' | 'hazard' | 'property_damage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  dateTime: Date;
  witnesses?: string[];
  immediateActions: string;
  status: 'reported' | 'investigating' | 'resolved';
  resolutionDetails?: string;
  followUpActions?: string[];
}
```

### Compliance Record
```typescript
interface ComplianceRecord {
  id: string;
  type: string;
  requirement: string;
  dueDate: Date;
  status: 'pending' | 'compliant' | 'non_compliant';
  assignedTo: string;
  evidence?: string[];
  lastAuditDate?: Date;
  nextAuditDate: Date;
  notes?: string;
}
```

## Client Management Models

### Client
```typescript
interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  status: 'active' | 'inactive' | 'prospect';
  industry: string;
  contacts: ClientContact[];
  projects: Project[];
  agreements: Agreement[];
  billingInfo: BillingInfo;
}
```

### Project
```typescript
interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate: Date;
  endDate?: Date;
  budget: number;
  team: TeamMember[];
  milestones: Milestone[];
  risks: Risk[];
}
```

## Document Models

### Document
```typescript
interface Document {
  id: string;
  type: 'policy' | 'procedure' | 'form' | 'contract' | 'report';
  title: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  content: string;
  metadata: DocumentMetadata;
  permissions: DocumentPermission[];
  history: DocumentHistory[];
}
```

### DocumentMetadata
```typescript
interface DocumentMetadata {
  author: string;
  createdAt: Date;
  lastModified: Date;
  tags: string[];
  category: string;
  expiryDate?: Date;
  reviewDate: Date;
}
```

## Audit & Logging Models

### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
}