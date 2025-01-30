-- Create type for charge calculation input
create type public.charge_calculation_input as (
  hourly_rate_award numeric,
  weekly_hours numeric,
  total_paid_weeks numeric,
  on_site_weeks numeric,
  annual_leave_weeks numeric,
  sick_leave_weeks numeric,
  training_weeks numeric,
  super_rate numeric,
  workers_comp_rate numeric,
  other_on_costs jsonb,
  funding_offset numeric,
  margin_rate numeric,
  leave_loading_rate numeric,
  training_fees jsonb
);

-- Create type for charge calculation result
create type public.charge_calculation_result as (
  annual_base_wage numeric,
  leave_loading_cost numeric,
  superannuation numeric,
  workers_comp numeric,
  other_on_costs numeric,
  training_fees numeric,
  gross_annual_cost numeric,
  net_annual_cost_after_funding numeric,
  margin_amount numeric,
  total_annual_charge numeric,
  weekly_charge_spread numeric,
  hourly_charge_spread numeric,
  weekly_charge_on_site numeric,
  hourly_charge_on_site numeric
);

-- Create function to calculate charges
create or replace function public.calculate_charges(
  input public.charge_calculation_input
) returns public.charge_calculation_result
language plpgsql
security definer
as $$
declare
  result public.charge_calculation_result;
  other_costs_sum numeric;
  training_fees_sum numeric;
begin
  -- Calculate annual base wage
  result.annual_base_wage := input.hourly_rate_award * input.weekly_hours * input.total_paid_weeks;
  
  -- Calculate leave loading
  result.leave_loading_cost := (result.annual_base_wage / input.total_paid_weeks * 
    (input.annual_leave_weeks + input.sick_leave_weeks)) * 
    coalesce(input.leave_loading_rate, 0.175);
  
  -- Calculate superannuation
  result.superannuation := result.annual_base_wage * input.super_rate;
  
  -- Calculate workers compensation
  result.workers_comp := result.annual_base_wage * input.workers_comp_rate;
  
  -- Sum other on-costs from JSON
  select coalesce(sum(value::numeric), 0)
  into other_costs_sum
  from jsonb_each_text(input.other_on_costs);
  result.other_on_costs := other_costs_sum;
  
  -- Sum training fees from JSON
  select coalesce(sum(value::numeric), 0)
  into training_fees_sum
  from jsonb_each_text(input.training_fees);
  result.training_fees := training_fees_sum;
  
  -- Calculate gross annual cost
  result.gross_annual_cost := result.annual_base_wage +
    result.leave_loading_cost +
    result.superannuation +
    result.workers_comp +
    result.other_on_costs +
    result.training_fees;
  
  -- Calculate net cost after funding
  result.net_annual_cost_after_funding := result.gross_annual_cost - input.funding_offset;
  
  -- Calculate margin
  result.margin_amount := result.net_annual_cost_after_funding * input.margin_rate;
  
  -- Calculate total annual charge
  result.total_annual_charge := result.net_annual_cost_after_funding + result.margin_amount;
  
  -- Calculate weekly and hourly charges (spread across year)
  result.weekly_charge_spread := result.total_annual_charge / input.total_paid_weeks;
  result.hourly_charge_spread := result.weekly_charge_spread / input.weekly_hours;
  
  -- Calculate weekly and hourly charges (on-site only)
  result.weekly_charge_on_site := result.total_annual_charge / input.on_site_weeks;
  result.hourly_charge_on_site := result.weekly_charge_on_site / input.weekly_hours;
  
  return result;
end;
$$;
