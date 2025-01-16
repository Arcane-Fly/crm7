import { createClient } from '@/lib/supabase/client'

export interface FundingClaim {
  id: string
  org_id: string
  claim_number: string
  amount: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submission_date?: string
  approval_date?: string
  rejection_reason?: string
  metadata?: Record<string, any>
}

export interface FundingEvidence {
  id: string
  claim_id: string
  document_type: string
  document_url: string
  status: 'pending' | 'verified' | 'rejected'
  verification_date?: string
  rejection_reason?: string
  metadata?: Record<string, any>
}

class FundingService {
  private supabase = createClient()

  async getClaims(params: { org_id: string; status?: string; start_date?: Date; end_date?: Date }) {
    const { org_id, status, start_date, end_date } = params
    const query = this.supabase.from('funding_claims').select('*').eq('org_id', org_id)

    if (status) {
      query.eq('status', status)
    }

    if (start_date) {
      query.gte('submission_date', start_date.toISOString())
    }

    if (end_date) {
      query.lte('submission_date', end_date.toISOString())
    }

    const { data, error } = await query.order('submission_date', { ascending: false })

    if (error) {
      throw error
    }

    return data as FundingClaim[]
  }

  async createClaim(params: {
    org_id: string
    claim_number: string
    amount: number
    metadata?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .insert({
        ...params,
        status: 'draft',
        submission_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as FundingClaim
  }

  async updateClaim(
    id: string,
    params: {
      status?: string
      approval_date?: Date
      rejection_reason?: string
      metadata?: Record<string, any>
    }
  ) {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .update({
        ...params,
        approval_date: params.approval_date?.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as FundingClaim
  }

  async getEvidence(claim_id: string) {
    const { data, error } = await this.supabase
      .from('funding_evidence')
      .select('*')
      .eq('claim_id', claim_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data as FundingEvidence[]
  }

  async uploadEvidence(params: {
    claim_id: string
    document_type: string
    document_url: string
    metadata?: Record<string, any>
  }) {
    const { data, error } = await this.supabase
      .from('funding_evidence')
      .insert({
        ...params,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as FundingEvidence
  }

  async verifyEvidence(
    id: string,
    params: {
      status: 'verified' | 'rejected'
      rejection_reason?: string
      metadata?: Record<string, any>
    }
  ) {
    const { data, error } = await this.supabase
      .from('funding_evidence')
      .update({
        ...params,
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as FundingEvidence
  }

  async uploadDocument(params: { fundingClaimId: string; documentType: string; file: File }) {
    const { fundingClaimId, documentType, file } = params
    const fileExt = file.name.split('.').pop()
    const fileName = `${fundingClaimId}/${documentType}-${Date.now()}.${fileExt}`

    // Upload file to storage
    const { error: uploadError } = await this.supabase.storage
      .from('funding-documents')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(`Failed to upload document: ${uploadError.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('funding-documents').getPublicUrl(fileName)

    // Create evidence record
    const { data: evidence, error: evidenceError } = await this.supabase
      .from('funding_evidence')
      .insert({
        claim_id: fundingClaimId,
        document_type: documentType,
        document_url: publicUrl,
        status: 'pending',
      })
      .select()
      .single()

    if (evidenceError) {
      throw new Error(`Failed to create evidence record: ${evidenceError.message}`)
    }

    return evidence
  }
}

export const fundingService = new FundingService()
