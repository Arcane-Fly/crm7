# Consolidated Data Models

## Core Entities

### Employee/Apprentice

```typescript
interface Employee {
  id: string;
  organization_id: string;
  employment_type: 'apprentice' | 'trainee' | 'skilled_labour';
  status: 'active' | 'terminated' | 'suspended';
  personal_info: {
    fullName: string;
    dateOfBirth?: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  employment_details: {
    startDate: string;
    endDate?: string;
    position: string;
    department: string;
    supervisor: string;
  };
  pay_details: {
    baseRate: number;
    allowances: Array<{
      type: string;
      amount: number;
    }>;
    overtimeRate: number;
    billingRate: number;
  };
  qualifications: Qualification[];
  training_records: TrainingRecord[];
  created_at: string;
  updated_at: string;
}

interface Qualification {
  id: string;
  qualification_name: string;
  institution: string;
  completion_date: string;
  certification_number: string;
  expiry_date?: string;
  certificate_url?: string;
  status: 'active' | 'expired' | 'pending';
}

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

### Award System

```typescript
interface Award {
  award_fixed_id: number;
  code: string;
  name: string;
  operative_from: string;
  operative_to?: string;
  published_year: number;
  version_number: number;
}

interface Classification {
  classification_fixed_id: number;
  award_fixed_id: number;
  classification: string;
  classification_level: number;
  base_rate?: number;
  base_rate_type?: string;
  calculated_rate?: number;
  calculated_rate_type?: string;
  operative_from: string;
  operative_to?: string;
}
```

### Funding & Claims

```typescript
interface FundingClaim {
  id: string;
  programId: string;
  apprenticeId: string;
  employerId: string;
  milestoneType: 'commencement' | 'progress' | 'completion';
  amount: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  evidence: Array<{
    documentType: string;
    documentUrl: string;
    uploadDate: string;
  }>;
  submission_date?: string;
  approval_date?: string;
  notes?: string;
}
```

### Compliance & Safety

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

### Reports & Analytics

```typescript
interface Report {
  id: string;
  name: string;
  description?: string;
  options: {
    fields: string[];
    filters?: Record<string, any>;
    groupBy?: string;
    sortBy?: string;
    format: 'pdf' | 'csv' | 'excel';
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: number;
    time: string;
    email: string;
  };
  lastRun?: string;
  nextRun?: string;
}
```
