# Fair Work Integration Service

## Service Overview

### Purpose

Provide real-time access to Fair Work award rates, conditions, and compliance rules through a dedicated microservice that handles all Fair Work API interactions and data management.

## Technical Architecture

### 1. API Integration Layer

#### Authentication

```typescript
interface FairWorkCredentials {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
```

#### Rate Endpoints

```typescript
interface AwardRate {
  awardCode: string;
  classificationCode: string;
  baseRate: number;
  casualLoading: number;
  penalties: Penalty[];
  allowances: Allowance[];
  effectiveFrom: Date;
  effectiveTo?: Date;
}

interface RateQuery {
  awardCode: string;
  classificationCode: string;
  employmentType: 'casual' | 'permanent' | 'fixed-term';
  date: Date;
  includeLoadings: boolean;
  includePenalties: boolean;
  includeAllowances: boolean;
}
```

#### Classification Endpoints

```typescript
interface Classification {
  code: string;
  level: string;
  description: string;
  parentCode?: string;
  validFrom: Date;
  validTo?: Date;
  attributes: Record<string, any>;
}

interface ClassificationQuery {
  awardCode: string;
  searchTerm?: string;
  effectiveDate?: Date;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}
```

### 2. Data Management

#### Cache Layer

```typescript
interface CacheConfig {
  ttl: number;
  maxSize: number;
  updateStrategy: 'lazy' | 'eager';
}

interface CacheEntry<T> {
  data: T;
  fetchedAt: Date;
  expiresAt: Date;
  version: number;
}
```

#### Sync Management

```typescript
interface SyncJob {
  id: string;
  type: 'award' | 'classification' | 'rate';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: Record<string, any>;
}

interface SyncConfig {
  frequency: 'hourly' | 'daily' | 'weekly';
  startTime: string;
  retryAttempts: number;
  notifyOnFailure: boolean;
}
```

### 3. Business Logic Layer

#### Rate Calculator

```typescript
interface RateCalculation {
  baseRate: number;
  casualLoading?: number;
  penalties: {
    code: string;
    description: string;
    amount: number;
  }[];
  allowances: {
    code: string;
    description: string;
    amount: number;
  }[];
  total: number;
  breakdown: Record<string, number>;
  metadata: {
    effectiveDate: Date;
    calculatedAt: Date;
    source: 'fairwork' | 'cached';
  };
}

interface CalculationOptions {
  includeLoadings: boolean;
  includePenalties: boolean;
  includeAllowances: boolean;
  roundingPrecision: number;
}
```

#### Validation Engine

```typescript
interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'enum' | 'custom';
  params?: Record<string, any>;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
  warnings: {
    field: string;
    message: string;
    code: string;
  }[];
}
```

## Implementation Details

### 1. API Client

```typescript
class FairWorkClient {
  constructor(credentials: FairWorkCredentials);
  
  async getAwardRate(query: RateQuery): Promise<AwardRate>;
  async getClassifications(query: ClassificationQuery): Promise<Classification[]>;
  async validateRate(rate: AwardRate): Promise<ValidationResult>;
  async syncAwardData(): Promise<SyncJob>;
}
```

### 2. Cache Manager

```typescript
class RateCache {
  constructor(config: CacheConfig);
  
  async get(key: string): Promise<CacheEntry<AwardRate> | null>;
  async set(key: string, data: AwardRate): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
  async cleanup(): Promise<void>;
}
```

### 3. Sync Manager

```typescript
class SyncManager {
  constructor(config: SyncConfig);
  
  async scheduleSyncJob(type: string): Promise<SyncJob>;
  async runSync(job: SyncJob): Promise<void>;
  async getStatus(jobId: string): Promise<SyncJob>;
  async handleFailure(job: SyncJob, error: Error): Promise<void>;
}
```

## API Endpoints

### 1. Rate Management

```typescript
// GET /api/rates
interface GetRateParams {
  award: string;
  classification: string;
  date: string;
  type: string;
}

// POST /api/rates/validate
interface ValidateRateParams {
  rate: AwardRate;
  options?: ValidationOptions;
}
```

### 2. Classification Management

```typescript
// GET /api/classifications
interface GetClassificationsParams {
  award: string;
  search?: string;
  date?: string;
  page?: number;
}

// GET /api/classifications/{code}
interface GetClassificationDetailParams {
  code: string;
  date?: string;
}
```

### 3. Sync Management

```typescript
// POST /api/sync
interface CreateSyncJobParams {
  type: string;
  options?: Record<string, any>;
}

// GET /api/sync/{jobId}
interface GetSyncStatusParams {
  jobId: string;
}
```

## Error Handling

### 1. Error Types

```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_NOT_FOUND = 'RATE_NOT_FOUND',
  SYNC_FAILED = 'SYNC_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',
}

interface ServiceError {
  type: ErrorType;
  message: string;
  code: string;
  details?: Record<string, any>;
}
```

### 2. Error Responses

```typescript
interface ErrorResponse {
  error: ServiceError;
  requestId: string;
  timestamp: string;
}
```

## Monitoring & Logging

### 1. Metrics

```typescript
interface ServiceMetrics {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  syncJobs: number;
  errors: number;
  latency: number;
}
```

### 2. Logging

```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context: Record<string, any>;
  trace?: string;
}
```

## Configuration

### 1. Service Config

```typescript
interface ServiceConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  cache: CacheConfig;
  sync: SyncConfig;
  monitoring: {
    enabled: boolean;
    interval: number;
  };
}
```

### 2. Environment Variables

```shell
FAIRWORK_API_KEY=xxx
FAIRWORK_CLIENT_ID=xxx
FAIRWORK_CLIENT_SECRET=xxx
FAIRWORK_ENV=production
CACHE_TTL=3600
SYNC_FREQUENCY=daily
MONITORING_ENABLED=true
```
