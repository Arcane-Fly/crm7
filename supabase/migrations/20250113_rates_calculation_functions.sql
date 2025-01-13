-- Rate calculation functions
CREATE OR REPLACE FUNCTION calculate_rate(
  p_template_id UUID,
  p_employee_id UUID,
  p_base_rate DECIMAL,
  p_casual_loading DECIMAL DEFAULT NULL,
  p_allowances JSONB DEFAULT '[]',
  p_penalties JSONB DEFAULT '[]'
) RETURNS TABLE (
  id UUID,
  template_id UUID,
  employee_id UUID,
  base_rate DECIMAL,
  casual_loading DECIMAL,
  allowances JSONB,
  penalties JSONB,
  super_amount DECIMAL,
  leave_loading_amount DECIMAL,
  workers_comp_amount DECIMAL,
  payroll_tax_amount DECIMAL,
  training_cost_amount DECIMAL,
  other_costs_amount DECIMAL,
  funding_offset_amount DECIMAL,
  margin_amount DECIMAL,
  total_cost DECIMAL,
  final_rate DECIMAL,
  calculation_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
DECLARE
  v_template rate_templates%ROWTYPE;
  v_base_cost DECIMAL;
  v_total_allowances DECIMAL;
  v_total_penalties DECIMAL;
BEGIN
  -- Get template details
  SELECT * INTO v_template 
  FROM rate_templates 
  WHERE id = p_template_id;

  -- Calculate base cost including casual loading if applicable
  v_base_cost := p_base_rate;
  IF p_casual_loading IS NOT NULL THEN
    v_base_cost := v_base_cost * (1 + p_casual_loading);
  END IF;

  -- Calculate allowances total
  SELECT COALESCE(SUM((value->>'amount')::DECIMAL), 0)
  INTO v_total_allowances
  FROM jsonb_array_elements(p_allowances) AS value;

  -- Calculate penalties total
  SELECT COALESCE(SUM((value->>'amount')::DECIMAL), 0)
  INTO v_total_penalties
  FROM jsonb_array_elements(p_penalties) AS value;

  -- Add base costs
  v_base_cost := v_base_cost + v_total_allowances + v_total_penalties;

  -- Calculate individual components
  RETURN QUERY
  SELECT
    gen_random_uuid() AS id,
    p_template_id AS template_id,
    p_employee_id AS employee_id,
    p_base_rate AS base_rate,
    p_casual_loading AS casual_loading,
    p_allowances AS allowances,
    p_penalties AS penalties,
    -- Superannuation
    ROUND(v_base_cost * v_template.super_rate, 2) AS super_amount,
    -- Leave loading
    ROUND(v_base_cost * COALESCE(v_template.leave_loading, 0), 2) AS leave_loading_amount,
    -- Workers compensation
    ROUND(v_base_cost * v_template.workers_comp_rate, 2) AS workers_comp_amount,
    -- Payroll tax
    ROUND(v_base_cost * v_template.payroll_tax_rate, 2) AS payroll_tax_amount,
    -- Training costs
    ROUND(v_base_cost * COALESCE(v_template.training_cost_rate, 0), 2) AS training_cost_amount,
    -- Other costs
    ROUND(v_base_cost * COALESCE(v_template.other_costs_rate, 0), 2) AS other_costs_amount,
    -- Funding offset
    ROUND(v_base_cost * COALESCE(v_template.funding_offset, 0), 2) AS funding_offset_amount,
    -- Calculate total cost before margin
    (
      v_base_cost +
      (v_base_cost * v_template.super_rate) +
      (v_base_cost * COALESCE(v_template.leave_loading, 0)) +
      (v_base_cost * v_template.workers_comp_rate) +
      (v_base_cost * v_template.payroll_tax_rate) +
      (v_base_cost * COALESCE(v_template.training_cost_rate, 0)) +
      (v_base_cost * COALESCE(v_template.other_costs_rate, 0)) -
      (v_base_cost * COALESCE(v_template.funding_offset, 0))
    ) AS total_cost,
    -- Calculate margin amount
    ROUND(
      (
        v_base_cost +
        (v_base_cost * v_template.super_rate) +
        (v_base_cost * COALESCE(v_template.leave_loading, 0)) +
        (v_base_cost * v_template.workers_comp_rate) +
        (v_base_cost * v_template.payroll_tax_rate) +
        (v_base_cost * COALESCE(v_template.training_cost_rate, 0)) +
        (v_base_cost * COALESCE(v_template.other_costs_rate, 0)) -
        (v_base_cost * COALESCE(v_template.funding_offset, 0))
      ) * v_template.base_margin,
      2
    ) AS margin_amount,
    -- Calculate final rate
    (
      v_base_cost +
      (v_base_cost * v_template.super_rate) +
      (v_base_cost * COALESCE(v_template.leave_loading, 0)) +
      (v_base_cost * v_template.workers_comp_rate) +
      (v_base_cost * v_template.payroll_tax_rate) +
      (v_base_cost * COALESCE(v_template.training_cost_rate, 0)) +
      (v_base_cost * COALESCE(v_template.other_costs_rate, 0)) -
      (v_base_cost * COALESCE(v_template.funding_offset, 0))
    ) * (1 + v_template.base_margin) AS final_rate,
    CURRENT_TIMESTAMP AS calculation_date,
    jsonb_build_object(
      'calculation_version', '1.0',
      'base_cost', v_base_cost,
      'total_allowances', v_total_allowances,
      'total_penalties', v_total_penalties
    ) AS metadata;
END;
$$ LANGUAGE plpgsql;
