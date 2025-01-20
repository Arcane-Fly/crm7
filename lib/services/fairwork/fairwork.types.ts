import { z } from 'zod';

/**
 * Award schema
 */
export const AwardSchema = z.object({
  code: z.string(),
  name: z.string(),
  industry: z.string(),
  occupation: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
  description: z.string().optional(),
  coverage: z.string().optional(),
});

/**
 * Classification schema
 */
export const ClassificationSchema = z.object({
  code: z.string(),
  name: z.string(),
  level: z.string().optional(),
  grade: z.string().optional(),
  yearOfExperience: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  parentCode: z.string().optional(),
  validFrom: z.string(),
  validTo: z.string().optional(),
});

/**
 * Pay rate schema
 */
export const PayRateSchema = z.object({
  baseRate: z.number(),
  casualLoading: z.number().optional(),
  penalties: z.array(z.object({
    code: z.string(),
    rate: z.number(),
    description: z.string(),
  })).optional(),
  allowances: z.array(z.object({
    code: z.string(),
    amount: z.number(),
    description: z.string(),
  })).optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Pay calculation schema
 */
export const PayCalculationSchema = z.object({
  baseRate: z.number(),
  casualLoading: z.number().optional(),
  penalties: z.array(z.object({
    code: z.string(),
    rate: z.number(),
    amount: z.number(),
    description: z.string(),
  })),
  allowances: z.array(z.object({
    code: z.string(),
    amount: z.number(),
    description: z.string(),
  })),
  total: z.number(),
  breakdown: z.object({
    base: z.number(),
    loading: z.number().optional(),
    penalties: z.number(),
    allowances: z.number(),
  }),
  metadata: z.object({
    calculatedAt: z.string(),
    effectiveDate: z.string(),
    source: z.enum(['fairwork', 'cached']),
  }),
});

/**
 * Penalty schema
 */
export const PenaltySchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  rate: z.number(),
  type: z.string(),
  conditions: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Allowance schema
 */
export const AllowanceSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  type: z.string(),
  conditions: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Leave entitlement schema
 */
export const LeaveEntitlementSchema = z.object({
  type: z.string(),
  amount: z.number(),
  unit: z.enum(['days', 'weeks', 'hours']),
  conditions: z.string().optional(),
  accrualMethod: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

/**
 * Public holiday schema
 */
export const PublicHolidaySchema = z.object({
  date: z.string(),
  name: z.string(),
  state: z.string().optional(),
  description: z.string().optional(),
});

// Export types
export type Award = z.infer<typeof AwardSchema>;
export type Classification = z.infer<typeof ClassificationSchema>;
export type PayRate = z.infer<typeof PayRateSchema>;
export type PayCalculation = z.infer<typeof PayCalculationSchema>;
export type Penalty = z.infer<typeof PenaltySchema>;
export type Allowance = z.infer<typeof AllowanceSchema>;
export type LeaveEntitlement = z.infer<typeof LeaveEntitlementSchema>;
export type PublicHoliday = z.infer<typeof PublicHolidaySchema>;
