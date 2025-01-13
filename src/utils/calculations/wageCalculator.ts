import type { 
  WageCalculationInput, 
  StatutoryRates, 
  LeaveEntitlements, 
  TrainingCosts,
  FundingSubsidies,
  GTOCosts 
} from '../../types/wageCalculator';

const WEEKS_PER_YEAR = 52;
const DEFAULT_SUPER_RATE = 0.105; // 10.5%
const DEFAULT_WORKERS_COMP_RATE = 0.03; // 3%
const DEFAULT_PAYROLL_TAX_THRESHOLD = 1200000; // $1.2M annual
const DEFAULT_PAYROLL_TAX_RATE = 0.0485; // 4.85%
const CASUAL_LOADING = 0.25; // 25%

interface BaseCalculations {
  baseHourlyRate: number;
  weeklyHours: number;
  annualSalary: number;
}

export function calculateBaseWage(input: WageCalculationInput): BaseCalculations {
  const { base_rate } = input.classification;
  if (!base_rate) throw new Error('Base rate not found for classification');
  
  // Apply casual loading if applicable
  const adjustedRate = input.employmentType === 'casual' 
    ? base_rate * (1 + CASUAL_LOADING)
    : base_rate;
  
  return {
    baseHourlyRate: adjustedRate,
    weeklyHours: input.hoursPerWeek,
    annualSalary: adjustedRate * input.hoursPerWeek * WEEKS_PER_YEAR
  };
}

export function calculateStatutoryContributions(
  baseAnnualSalary: number,
  rates: Partial<StatutoryRates> = {}
): StatutoryRates {
  return {
    superannuation: rates.superannuation ?? DEFAULT_SUPER_RATE,
    workersComp: rates.workersComp ?? DEFAULT_WORKERS_COMP_RATE,
    payrollTax: baseAnnualSalary > DEFAULT_PAYROLL_TAX_THRESHOLD ? 
      (rates.payrollTax ?? DEFAULT_PAYROLL_TAX_RATE) : undefined
  };
}

export function calculateLeaveEntitlements(
  baseHourlyRate: number,
  weeklyHours: number,
  entitlements: Partial<LeaveEntitlements> = {}
): LeaveEntitlements {
  return {
    annualLeaveWeeks: entitlements.annualLeaveWeeks ?? 4,
    annualLeaveLoading: entitlements.annualLeaveLoading ?? 0.175,
    sickLeaveEntitlement: entitlements.sickLeaveEntitlement ?? 10,
    publicHolidays: entitlements.publicHolidays ?? 11,
  };
}

export function calculateTrainingCosts(
  baseAnnualSalary: number,
  costs: Partial<TrainingCosts> = {}
): TrainingCosts {
  return {
    courseFees: costs.courseFees ?? 0,
    materialsCosts: costs.materialsCosts ?? 0,
    travelAllowance: costs.travelAllowance,
    nonProductiveTime: costs.nonProductiveTime ?? 0.2,
  };
}

export function calculateFinalCosts(params: {
  baseCalculations: BaseCalculations;
  statutoryRates: StatutoryRates;
  leaveEntitlements: LeaveEntitlements;
  trainingCosts: TrainingCosts;
  fundingSubsidies: FundingSubsidies;
  gtoCosts: GTOCosts;
}) {
  const { 
    baseCalculations,
    statutoryRates,
    leaveEntitlements,
    trainingCosts,
    fundingSubsidies,
    gtoCosts,
  } = params;

  const { baseHourlyRate, weeklyHours } = baseCalculations;

  // Calculate weekly statutory costs
  const weeklySuperannuation = baseHourlyRate * weeklyHours * statutoryRates.superannuation;
  const weeklyWorkersComp = baseHourlyRate * weeklyHours * statutoryRates.workersComp;
  const weeklyPayrollTax = statutoryRates.payrollTax ? 
    (baseHourlyRate * weeklyHours * statutoryRates.payrollTax) : 0;

  // Calculate weekly leave costs
  const weeklyLeaveLoading = (
    baseHourlyRate * weeklyHours * 
    leaveEntitlements.annualLeaveWeeks * 
    leaveEntitlements.annualLeaveLoading
  ) / WEEKS_PER_YEAR;

  // Calculate weekly training costs
  const weeklyTrainingCosts = (
    trainingCosts.courseFees + 
    trainingCosts.materialsCosts + 
    (trainingCosts.travelAllowance ?? 0)
  ) / WEEKS_PER_YEAR;

  // Calculate weekly subsidies
  const weeklySubsidies = (
    fundingSubsidies.governmentIncentives + 
    fundingSubsidies.trainingSubsidies + 
    (fundingSubsidies.otherSubsidies ?? 0)
  ) / WEEKS_PER_YEAR;

  // Calculate total weekly cost before margin
  const weeklyBaseCost = 
    (baseHourlyRate * weeklyHours) +
    weeklySuperannuation +
    weeklyWorkersComp +
    weeklyPayrollTax +
    weeklyLeaveLoading +
    weeklyTrainingCosts -
    weeklySubsidies +
    gtoCosts.adminFeeWeekly;

  // Apply GTO margin
  const totalWeeklyCost = weeklyBaseCost * (1 + gtoCosts.marginPercentage);
  const totalAnnualCost = totalWeeklyCost * WEEKS_PER_YEAR;
  const effectiveHourlyRate = totalWeeklyCost / weeklyHours;

  return {
    totalWeeklyCost,
    totalAnnualCost,
    effectiveHourlyRate,
    costBreakdown: {
      baseWage: baseHourlyRate * weeklyHours,
      superannuation: weeklySuperannuation,
      workersComp: weeklyWorkersComp,
      payrollTax: weeklyPayrollTax,
      leaveLoading: weeklyLeaveLoading,
      trainingCosts: weeklyTrainingCosts,
      subsidies: weeklySubsidies,
      adminFee: gtoCosts.adminFeeWeekly,
      margin: weeklyBaseCost * gtoCosts.marginPercentage,
      total: totalWeeklyCost,
    },
  };
}