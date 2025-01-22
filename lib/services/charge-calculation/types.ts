export type BillingMethod = 'hourly' | 'fixed'

export interface ChargeConfig {
  orgId: string
  baseRate: number
  hours: number
  onCosts?: Record<string, number>
  trainingFees?: Record<string, number>
}

export interface ChargeCalculationResult {
  baseCharge: number
  otherOnCosts: number
  trainingFees: number
  totalCharge: number
  hours: number
}

export interface ChargeRateResult {
  chargeRate: number
  billingMethod: BillingMethod
  baseCharge: number
  otherOnCosts: number
  trainingFees: number
  totalCharge: number
}

export interface ChargeSummary {
  totalAmount: number
  numberOfRates: number
  averageRate: number
  timestamp: string
}
