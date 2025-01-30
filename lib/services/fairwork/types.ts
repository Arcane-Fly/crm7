export interface FairWorkConfig {
  baseUrl: string;
  apiKey: string;
  cacheConfig?: {
    ttl?: number;
    prefix?: string;
  };
}

export interface Award {
  code: string;
  name: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface Classification {
  code: string;
  name: string;
  level: string;
  grade?: string;
}

export interface ClassificationHierarchy {
  code: string;
  name: string;
  children: ClassificationHierarchy[];
}

export interface RateTemplate {
  code: string;
  name: string;
  baseRate: number;
  allowances: Array<{
    code: string;
    amount: number;
  }>;
  penalties: Array<{
    code: string;
    multiplier: number;
  }>;
}

export interface AwardRate extends Rate {
  awardCode: string;
  classificationCode: string;
}

export interface Rate {
  baseRate: number;
  allowances: Array<{
    code: string;
    amount: number;
  }>;
  penalties: Array<{
    code: string;
    multiplier: number;
  }>;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface GetBaseRateParams {
  awardCode: string;
  classificationCode: string;
  date?: Date;
}

export interface GetClassificationsParams {
  awardCode: string;
  includeInactive?: boolean;
}

export interface GetFutureRatesParams {
  awardCode: string;
  classificationCode: string;
  startDate: Date;
  endDate: Date;
}

export interface GetRateHistoryParams {
  awardCode: string;
  classificationCode: string;
  startDate: Date;
  endDate: Date;
}

export interface RateCalculationRequest {
  awardCode: string;
  classificationCode: string;
  employmentType: 'permanent' | 'casual' | 'fixed-term';
  date: Date;
  hours: number;
  penalties?: Array<{
    code: string;
    multiplier: number;
  }>;
  allowances?: Array<{
    code: string;
    amount: number;
  }>;
}

export interface RateCalculationResponse {
  baseRate: number;
  penalties: Array<{
    code: string;
    amount: number;
  }>;
  allowances: Array<{
    code: string;
    amount: number;
  }>;
  total: number;
  breakdown: {
    base: number;
    penalties: number;
    allowances: number;
  };
  metadata: {
    calculatedAt: Date;
    effectiveDate: Date;
    source: 'fairwork' | 'cached';
  };
}

export interface ValidateRateParams {
  awardCode: string;
  classificationCode: string;
  rate: number;
  date?: Date;
}

export interface RateValidationResponse {
  isValid: boolean;
  minimumRate: number;
  maximumRate?: number;
  validationDate: Date;
  messages?: string[];
}
