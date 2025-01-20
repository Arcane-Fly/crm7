import { supabase } from '@/lib/supabase/client'
import { ApiError } from '@/lib/utils/error'
import { logger } from '@/lib/services/logger'
import { RateManagementService } from '@/lib/services/rates/rate-management-service'
import type { ChargeRateConfig, ChargeRateResult, BillingMethod } from './types'

/**
 * Service for calculating charge rates using Supabase
 */
export class ChargeCalculationService {
  private rateService: RateManagementService

  constructor(rateService: RateManagementService) {
    this.rateService = rateService
  }

  /**
   * Calculate charge rates using the Supabase function
   */
  async calculateCharges(config: ChargeRateConfig): Promise<ChargeRateResult> {
    try {
      // Get the current pay rate with penalties and allowances
      const rates = await this.rateService.getClassificationRates(
        config.classificationCode,
        new Date()
      )

      if (!rates.length) {
        throw new ApiError({
          message: 'No valid pay rates found for classification',
          code: 'NO_RATES_FOUND',
        })
      }

      // Calculate the total rate including penalties and allowances
      const rateResult = await this.rateService.calculateTotalRate(
        rates[0].id,
        config.weeklyHours,
        new Date(),
        config.conditions
      )

      // Convert to input format expected by Supabase function
      const input = {
        hourly_rate_award: rateResult.baseAmount / config.weeklyHours,
        weekly_hours: config.weeklyHours,
        total_paid_weeks: config.totalPaidWeeks,
        on_site_weeks: config.onSiteWeeks,
        annual_leave_weeks: config.annualLeaveWeeks,
        sick_leave_weeks: config.sickLeaveWeeks,
        training_weeks: config.trainingWeeks,
        super_rate: config.superRate,
        workers_comp_rate: config.workersCompRate,
        other_on_costs: config.otherOnCosts,
        funding_offset: config.fundingOffset,
        margin_rate: config.marginRate,
        leave_loading_rate: config.leaveLoadingRate || 0.175,
        training_fees: config.trainingFees || {},
      }

      const { data, error } = await supabase.rpc('calculate_charges', { input })

      if (error) {
        logger.error('Error calculating charges:', {
          error,
          config,
        })
        throw new ApiError({
          message: 'Failed to calculate charges',
          cause: error,
        })
      }

      // Convert snake_case response to camelCase
      return {
        annualBaseWage: data.annual_base_wage,
        leaveLoadingCost: data.leave_loading_cost,
        superannuation: data.superannuation,
        workersComp: data.workers_comp,
        otherOnCosts: data.other_on_costs,
        trainingFees: data.training_fees,
        grossAnnualCost: data.gross_annual_cost,
        netAnnualCostAfterFunding: data.net_annual_cost_after_funding,
        marginAmount: data.margin_amount,
        totalAnnualCharge: data.total_annual_charge,
        weeklyChargeSpread: data.weekly_charge_spread,
        hourlyChargeSpread: data.hourly_charge_spread,
        weeklyChargeOnSite: data.weekly_charge_on_site,
        hourlyChargeOnSite: data.hourly_charge_on_site,
      }
    } catch (error) {
      logger.error('Error in calculateCharges:', error)
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to calculate charges',
            cause: error instanceof Error ? error : new Error(String(error)),
          })
    }
  }

  /**
   * Get the appropriate charge rate based on billing method
   */
  static getChargeRate(result: ChargeRateResult, method: BillingMethod) {
    switch (method) {
      case BillingMethod.SPREAD_ACROSS_YEAR:
        return {
          weeklyCharge: result.weeklyChargeSpread,
          hourlyCharge: result.hourlyChargeSpread,
        }
      case BillingMethod.ON_SITE_ONLY:
        return {
          weeklyCharge: result.weeklyChargeOnSite,
          hourlyCharge: result.hourlyChargeOnSite,
        }
      default:
        throw new ApiError({
          message: 'Invalid billing method',
          code: 'INVALID_BILLING_METHOD',
        })
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  /**
   * Generate a summary of the charge calculation
   */
  static generateSummary(result: ChargeRateResult): string {
    const format = this.formatCurrency

    return `
Charge Rate Summary:
-------------------
Base Annual Wage: ${format(result.annualBaseWage)}
Leave Loading: ${format(result.leaveLoadingCost)}
Superannuation: ${format(result.superannuation)}
Workers Compensation: ${format(result.workersComp)}
Other On-costs: ${format(result.otherOnCosts)}
Training Fees: ${format(result.trainingFees)}

Gross Annual Cost: ${format(result.grossAnnualCost)}
Net Cost After Funding: ${format(result.netAnnualCostAfterFunding)}
Margin Amount: ${format(result.marginAmount)}
Total Annual Charge: ${format(result.totalAnnualCharge)}

Method A (Spread Across Year):
Weekly Charge: ${format(result.weeklyChargeSpread)}
Hourly Charge: ${format(result.hourlyChargeSpread)}

Method B (On-site Only):
Weekly Charge: ${format(result.weeklyChargeOnSite)}
Hourly Charge: ${format(result.hourlyChargeOnSite)}
`.trim()
  }
}
