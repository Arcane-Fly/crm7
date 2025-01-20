export interface ChargeRateConfig {
  hourlyRateAward: number
  weeklyHours: number
  totalPaidWeeks: number
  onSiteWeeks: number
  annualLeaveWeeks: number
  sickLeaveWeeks: number
  trainingWeeks: number
  superRate: number
  workersCompRate: number
  otherOnCosts: {
    payrollTax?: number
    ppe?: number
    adminOverhead?: number
    enrollmentFees?: number
    [key: string]: number | undefined
  }
  fundingOffset: number
  marginRate: number
  leaveLoadingRate?: number
  trainingFees?: {
    tuitionFees?: number
    booksAndSupplies?: number
    [key: string]: number | undefined
  }
}

export interface ChargeRateResult {
  annualBaseWage: number
  leaveLoadingCost: number
  superannuation: number
  workersComp: number
  otherOnCosts: number
  trainingFees: number
  grossAnnualCost: number
  netAnnualCostAfterFunding: number
  marginAmount: number
  totalAnnualCharge: number
  weeklyChargeSpread: number
  hourlyChargeSpread: number
  weeklyChargeOnSite: number
  hourlyChargeOnSite: number
}

export enum BillingMethod {
  SPREAD_ACROSS_YEAR = 'SPREAD_ACROSS_YEAR',
  ON_SITE_ONLY = 'ON_SITE_ONLY',
}
