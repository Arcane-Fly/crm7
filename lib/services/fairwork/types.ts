export interface FairWorkConfig {
  apiKey: string;
  apiUrl: string;
  baseUrl?: string;
  environment?: 'sandbox' | 'production';
  timeout?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface Award {
  code: string;
  name: string;
  effectiveFrom: string;
  effectiveTo?: string;
  classifications: Classification[];
  penalties?: Penalty[];
  allowances?: Allowance[];
}

export interface Classification {
  code: string;
  name: string;
  level: string;
  baseRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  parentCode?: string;
}

export interface ClassificationHierarchy {
  code: string;
  name: string;
  children: ClassificationHierarchy[];
}

export interface Penalty {
  code: string;
  name: string;
  description: string;
  rate: number;
  type: 'percentage' | 'fixed';
  conditions?: string[];
}

export interface Allowance {
  code: string;
  name: string;
  description: string;
  amount: number;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  conditions?: string[];
}

export interface RateTemplate {
  code: string;
  name: string;
  baseRate: number;
  penalties: string[];
  allowances: string[];
}

export interface RateValidationRequest {
  rate: number;
  awardCode: string;
  classificationCode: string;
  date?: string;
  penalties?: string[];
  allowances?: string[];
}

export interface RateValidationResponse {
  valid: boolean;
  minimumRate: number;
  error?: string;
  details?: {
    baseRate: number;
    penalties: Array<{ code: string; amount: number }>;
    allowances: Array<{ code: string; amount: number }>;
    total: number;
  };
}

export interface GetClassificationsParams {
  awardCode: string;
  effectiveDate?: string;
  includeInactive?: boolean;
}

export interface Rate {
  baseRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  penalties?: Array<{ code: string; rate: number }>;
  allowances?: Array<{ code: string; amount: number }>;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
}
