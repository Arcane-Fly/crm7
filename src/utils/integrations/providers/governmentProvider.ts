import { supabase } from '../../../lib/supabase';
import type { IntegrationConnection } from '../../../types/integration';
import type { FundingClaim } from '../../../types/funding';

export async function submitFundingClaim(
  connection: IntegrationConnection,
  claim: FundingClaim
) {
  try {
    // Transform claim data according to government portal requirements
    const transformedClaim = transformClaimData(claim, connection);

    // Submit to government portal
    const response = await submitToPortal(transformedClaim, connection);

    if (response.success) {
      // Update claim status
      await supabase
        .from('funding_claims')
        .update({
          portal_reference: response.referenceNumber,
          status: 'submitted',
          submission_date: new Date().toISOString()
        })
        .eq('id', claim.id);

      // Log successful submission
      await logSync(connection.id, 'claim_submission', 'success',
        `Successfully submitted claim ${claim.id} to portal`);
    }

    return response;
  } catch (error) {
    // Log submission error
    await logSync(connection.id, 'claim_submission', 'error',
      error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

function transformClaimData(
  claim: FundingClaim,
  connection: IntegrationConnection
) {
  // Transform data according to government portal requirements
  return {
    claimReference: claim.id,
    programCode: claim.programId,
    apprenticeId: claim.apprenticeId,
    employerId: claim.employerId,
    milestoneType: claim.milestoneType,
    claimAmount: claim.amount,
    evidenceDocuments: claim.evidence.map(doc => ({
      type: doc.documentType,
      url: doc.documentUrl,
      uploadDate: doc.uploadDate
    }))
  };
}

async function submitToPortal(data: any, connection: IntegrationConnection) {
  // Implementation would vary based on government portal's API
  // This is a placeholder for the actual API call
  return { 
    success: true,
    referenceNumber: `GOV-${Date.now()}`
  };
}

async function logSync(
  connectionId: string,
  eventType: string,
  status: 'success' | 'error' | 'warning',
  message: string,
  details?: Record<string, any>
) {
  await supabase.from('integration_logs').insert({
    connection_id: connectionId,
    event_type: eventType,
    status,
    message,
    details
  });
}