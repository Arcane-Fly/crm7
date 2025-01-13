import { z } from 'zod';
import type { MilestoneType } from '../../types/funding';

export const claimValidationSchema = z.object({
  programId: z.string().min(1, 'Program ID is required'),
  milestoneType: z.enum(['commencement', 'progress', 'completion'] as const, {
    required_error: 'Milestone type is required',
  }),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(100000, 'Amount exceeds maximum limit'),
  evidence: z.array(z.instanceof(File))
    .min(1, 'At least one supporting document is required')
    .max(5, 'Maximum 5 files allowed'),
  notes: z.string().optional(),
});

export type ClaimValidationSchema = z.infer<typeof claimValidationSchema>;

export const validateMilestoneEligibility = (
  milestoneType: MilestoneType,
  completedUnits: number,
  totalUnits: number
): { eligible: boolean; reason?: string } => {
  switch (milestoneType) {
    case 'commencement':
      return { eligible: true };
    case 'progress':
      const progressPercentage = (completedUnits / totalUnits) * 100;
      return {
        eligible: progressPercentage >= 50,
        reason: progressPercentage < 50 
          ? 'Apprentice must complete at least 50% of units for progress payment'
          : undefined
      };
    case 'completion':
      return {
        eligible: completedUnits === totalUnits,
        reason: completedUnits < totalUnits 
          ? 'All units must be completed for completion payment'
          : undefined
      };
    default:
      return { eligible: false, reason: 'Invalid milestone type' };
  }
};