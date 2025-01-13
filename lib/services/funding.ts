import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase/server'

interface FundingProgram {
  id?: string
  name: string
  description?: string
  eligibilityCriteria?: Record<string, any>
  contactInfo?: Record<string, any>
}

interface FundingClaim {
  id?: string
  programId: string
  employeeId: string
  hostEmployerId?: string
  amountClaimed: number
  referenceNumber?: string
  notes?: string
}

interface ClaimDocument {
  fundingClaimId: string
  documentType: string
  file: File
  fileName?: string
}

interface ClaimApproval {
  fundingClaimId: string
  approverId: string
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'resubmitted'
  notes?: string
}

export class FundingService {
  private supabase = createClient()

  async createProgram(program: FundingProgram) {
    const { data, error } = await this.supabase
      .from('funding_programs')
      .insert({
        name: program.name,
        description: program.description,
        eligibility_criteria: program.eligibilityCriteria,
        contact_info: program.contactInfo
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createClaim(claim: FundingClaim) {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .insert({
        program_id: claim.programId,
        employee_id: claim.employeeId,
        host_employer_id: claim.hostEmployerId,
        amount_claimed: claim.amountClaimed,
        reference_number: claim.referenceNumber,
        notes: claim.notes
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async uploadDocument(document: ClaimDocument) {
    const { file, fundingClaimId, documentType, fileName } = document
    
    // Upload file to storage
    const fileExt = file.name.split('.').pop()
    const filePath = `funding-claims/${fundingClaimId}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await this.supabase
      .storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = this.supabase
      .storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data, error } = await this.supabase
      .from('funding_claim_documents')
      .insert({
        funding_claim_id: fundingClaimId,
        document_type: documentType,
        file_url: publicUrl,
        file_name: fileName || file.name,
        file_size: file.size,
        content_type: file.type
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createApproval(approval: ClaimApproval) {
    const { data, error } = await this.supabase
      .from('funding_claim_approvals')
      .insert({
        funding_claim_id: approval.fundingClaimId,
        approver_id: approval.approverId,
        approval_status: approval.approvalStatus,
        approval_date: new Date(),
        notes: approval.notes
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getClaimWithDetails(claimId: string) {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .select(`
        *,
        funding_programs (
          id,
          name,
          description
        ),
        employees (
          id,
          first_name,
          last_name
        ),
        organizations (
          id,
          name
        ),
        funding_claim_documents (
          id,
          document_type,
          file_url,
          file_name,
          uploaded_at
        ),
        funding_claim_approvals (
          id,
          approver_id,
          approval_status,
          approval_date,
          notes
        )
      `)
      .eq('id', claimId)
      .single()

    if (error) throw error
    return data
  }

  async getPendingClaims() {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .select(`
        *,
        funding_programs (
          name
        ),
        employees (
          first_name,
          last_name
        )
      `)
      .in('claim_status', ['pending', 'resubmitted'])

    if (error) throw error
    return data
  }

  async updateClaimStatus(claimId: string, status: string, notes?: string) {
    const { error } = await this.supabase
      .from('funding_claims')
      .update({
        claim_status: status,
        notes: notes,
        date_approved: status === 'approved' ? new Date() : null
      })
      .eq('id', claimId)

    if (error) throw error
  }

  async getFundingStats() {
    const { data, error } = await this.supabase
      .from('funding_claims')
      .select(`
        claim_status,
        amount_claimed
      `)

    if (error) throw error

    return data.reduce((acc, claim) => {
      if (!acc[claim.claim_status]) {
        acc[claim.claim_status] = {
          count: 0,
          total: 0
        }
      }
      acc[claim.claim_status].count++
      acc[claim.claim_status].total += claim.amount_claimed
      return acc
    }, {} as Record<string, { count: number; total: number }>)
  }
}
