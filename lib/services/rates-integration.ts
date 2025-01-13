import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { RateTemplate, RateCalculation } from './rates'

export interface IntegrationConfig {
  id: string
  org_id: string
  integration_type: 'payroll' | 'hr' | 'accounting' | 'custom'
  provider: string
  credentials: Record<string, any>
  settings: Record<string, any>
  is_active: boolean
  metadata?: Record<string, any>
}

export interface SyncResult {
  success: boolean
  records_processed: number
  records_failed: number
  error_log?: Record<string, any>[]
  metadata?: Record<string, any>
}

export class RatesIntegrationService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async getIntegrations(org_id: string): Promise<IntegrationConfig[]> {
    const { data, error } = await this.supabase
      .from('integration_configs')
      .select('*')
      .eq('org_id', org_id)
      .eq('is_active', true)

    if (error) throw error
    return data
  }

  async syncRates(params: {
    org_id: string
    integration_id: string
    sync_type: 'import' | 'export'
    start_date?: Date
    end_date?: Date
    options?: Record<string, any>
  }): Promise<SyncResult> {
    const { data, error } = await this.supabase.rpc('sync_rates', params)
    if (error) throw error
    return data
  }

  async validateIntegration(config: Partial<IntegrationConfig>): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const { data, error } = await this.supabase.rpc('validate_integration', {
      config: config
    })
    if (error) throw error
    return data
  }

  async importRates(params: {
    integration_id: string
    import_type: 'templates' | 'calculations' | 'both'
    options?: Record<string, any>
  }): Promise<SyncResult> {
    const { data, error } = await this.supabase.rpc('import_rates', params)
    if (error) throw error
    return data
  }

  async exportRates(params: {
    integration_id: string
    export_type: 'templates' | 'calculations' | 'both'
    filters?: Record<string, any>
    options?: Record<string, any>
  }): Promise<SyncResult> {
    const { data, error } = await this.supabase.rpc('export_rates', params)
    if (error) throw error
    return data
  }

  async scheduleSync(params: {
    integration_id: string
    schedule_type: 'hourly' | 'daily' | 'weekly' | 'monthly'
    sync_type: 'import' | 'export' | 'both'
    options?: Record<string, any>
  }): Promise<{
    schedule_id: string
    next_run: Date
  }> {
    const { data, error } = await this.supabase.rpc('schedule_rate_sync', params)
    if (error) throw error
    return data
  }

  async getSyncHistory(params: {
    org_id: string
    integration_id?: string
    start_date?: Date
    end_date?: Date
  }): Promise<{
    id: string
    integration_id: string
    sync_type: 'import' | 'export'
    status: 'success' | 'failed'
    records_processed: number
    records_failed: number
    started_at: Date
    completed_at: Date
    error_log?: Record<string, any>[]
    metadata?: Record<string, any>
  }[]> {
    const { data, error } = await this.supabase
      .from('integration_sync_history')
      .select('*')
      .eq('org_id', params.org_id)
      .eq(params.integration_id ? 'integration_id' : true, params.integration_id || true)
      .gte(params.start_date ? 'started_at' : true, params.start_date?.toISOString() || true)
      .lte(params.end_date ? 'started_at' : true, params.end_date?.toISOString() || true)
      .order('started_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getIntegrationStatus(integration_id: string): Promise<{
    is_connected: boolean
    last_sync?: Date
    next_sync?: Date
    error?: string
    metadata?: Record<string, any>
  }> {
    const { data, error } = await this.supabase.rpc('get_integration_status', {
      integration_id
    })
    if (error) throw error
    return data
  }
}

export const ratesIntegrationService = new RatesIntegrationService()
