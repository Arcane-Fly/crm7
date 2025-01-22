import { RateManagementService } from './rate-management-service'
import { FairWorkService } from '../fairwork/fairwork-service'
import type { RateTemplate } from '@/lib/types/rates'

export type { RateTemplate }

export interface RateCalculation {
  templateId: string
  baseRate: number
  adjustments: {
    location?: number
    skill?: number
  }
  totalRate: number
  metadata?: Record<string, unknown>
  calculatedAt: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  templateId?: string
}

// Initialize services
const fairWorkService = new FairWorkService()
export const ratesService = new RateManagementService(fairWorkService)
