import { RateManagementService } from './rate-management-service'
import { FairWorkService } from '../fairwork/fairwork-service'

export interface RateTemplate {
  id: string
  org_id: string
  name: string
  description?: string
  base_rate: number
  location_adjustment?: number
  skill_adjustment?: number
  type: 'standard' | 'fairwork'
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

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
const fairWorkService = new FairWorkService({
  apiKey: process.env.FAIRWORK_API_KEY!,
  apiUrl: process.env.FAIRWORK_API_URL!,
  baseUrl: process.env.FAIRWORK_BASE_URL!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  timeout: 30000,
  retryAttempts: 3,
})

export const rateService = new RateManagementService(fairWorkService)
