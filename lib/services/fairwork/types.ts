export interface FairWorkConfig {
  apiKey?: string;
  apiUrl?: string;
  baseUrl?: string;
  environment?: 'sandbox' | 'production';
  timeout?: number;
  retryAttempts?: number;
}

export interface AwardRate {
  awardCode: string;
  classificationCode: string;
  baseRate: number;
  casualLoading?: number;
  penalties?: Array<{
    code: string;
    rate: number;
    description: string;
  }>;
  allowances?: Array<{
    code: string;
    amount: number;
    description: string;
  }>;
  effectiveFrom: Date;
  effectiveTo?: Date;
  id: string;
  rate: number;
  effectiveDate: string;
  status: 'active' | 'inactive';
}

export interface Classification {
  code: string;
  name: string;
  level: string;
  grade?: string;
  yearOfExperience?: number;
  qualifications?: string[];
  parentCode?: string;
  validFrom: Date;
  validTo?: Date;
}

export interface RateCalculationRequest {
  awardCode: string;
  classificationCode: string;
  employmentType: 'casual' | 'permanent' | 'fixed-term';
  date: Date;
  hours?: number;
  penalties?: string[];
  allowances?: string[];
}

export interface RateCalculationResponse {
  baseRate: number;
  casualLoading?: number;
  penalties: Array<{
    code: string;
    rate: number;
    amount: number;
    description: string;
  }>;
  allowances: Array<{
    code: string;
    amount: number;
    description: string;
  }>;
  total: number;
  breakdown: {
    base: number;
    loading?: number;
    penalties: number;
    allowances: number;
  };
  metadata: {
    calculatedAt: Date;
    effectiveDate: Date;
    source: 'fairwork' | 'cached';
  };
}

export interface RateValidationResponse {
  isValid: boolean;
  minimumRate: number;
  difference: number;
}

export type GetBaseRateParams = {
  awardCode: string;
  classificationCode: string;
  date: Date;
};

export type GetClassificationsParams = {
  awardCode: string;
  searchTerm?: string;
  date?: Date;
  includeInactive?: boolean;
};

export type GetRateHistoryParams = {
  awardCode: string;
  classificationCode: string;
  startDate: Date;
  endDate: Date;
};

export type GetFutureRatesParams = {
  awardCode: string;
  classificationCode: string;
  fromDate: Date;
};

export type ValidateRateParams = {
  awardCode: string;
  classificationCode: string;
  rate: number;
  date: Date;
};
