-- Advanced validation rules
ALTER TABLE public.rate_validation_rules
ADD COLUMN IF NOT EXISTS dependencies jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS conditions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS validation_groups text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS template_types text[] DEFAULT '{}'::text[];

-- Rate forecasting tables
CREATE TABLE IF NOT EXISTS public.rate_forecasts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id),
    template_id uuid REFERENCES public.rate_templates (id),
    forecast_name text NOT NULL,
    forecast_type text NOT NULL,
    base_rate_adjustment decimal(10,2),
    margin_adjustment decimal(10,2),
    cost_adjustments jsonb DEFAULT '{}'::jsonb,
    start_date date NOT NULL,
    end_date date NOT NULL,
    interval_type text NOT NULL,
    assumptions jsonb DEFAULT '{}'::jsonb,
    created_by uuid REFERENCES auth.users (id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_forecast_type CHECK (
        forecast_type IN ('linear', 'seasonal', 'custom')
    ),
    CONSTRAINT valid_interval_type CHECK (
        interval_type IN ('weekly', 'monthly', 'quarterly', 'yearly')
    )
);

CREATE TABLE IF NOT EXISTS public.rate_forecast_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    forecast_id uuid REFERENCES public.rate_forecasts (id),
    forecast_date date NOT NULL,
    base_rate decimal(10,2) NOT NULL,
    final_rate decimal(10,2) NOT NULL,
    components jsonb NOT NULL,
    confidence_score decimal(5,2),
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Bulk calculation tables
CREATE TABLE IF NOT EXISTS public.bulk_rate_calculations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id),
    name text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    template_ids uuid[] NOT NULL,
    employee_ids uuid[] NOT NULL,
    calculation_date date NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    results jsonb DEFAULT '{}'::jsonb,
    error_log jsonb DEFAULT '[]'::jsonb,
    created_by uuid REFERENCES auth.users (id),
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_bulk_calc_status CHECK (
        status IN ('pending', 'processing', 'completed', 'failed')
    )
);

-- Rate analytics and reporting
CREATE TABLE IF NOT EXISTS public.rate_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id),
    analysis_date date NOT NULL,
    analysis_type text NOT NULL,
    metrics jsonb NOT NULL,
    dimensions jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_analysis_type CHECK (
        analysis_type IN ('cost_distribution', 'margin_analysis', 'trend_analysis', 'variance_analysis')
    )
);

CREATE TABLE IF NOT EXISTS public.rate_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id),
    report_name text NOT NULL,
    report_type text NOT NULL,
    parameters jsonb NOT NULL,
    schedule jsonb DEFAULT NULL,
    recipients jsonb DEFAULT '[]'::jsonb,
    last_run_at timestamptz,
    next_run_at timestamptz,
    created_by uuid REFERENCES auth.users (id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_report_type CHECK (
        report_type IN ('cost_analysis', 'margin_analysis', 'forecast_analysis', 'compliance_audit')
    )
);

-- Advanced validation functions
CREATE OR REPLACE FUNCTION validate_rate_template_advanced(
    template_id uuid,
    validation_groups text[] DEFAULT NULL
)
RETURNS TABLE (
    is_valid boolean,
    validation_results jsonb
) LANGUAGE plpgsql AS $$
DECLARE
    v_template rate_templates%ROWTYPE;
    v_results jsonb = '[]'::jsonb;
    v_rule record;
    v_is_valid boolean = true;
BEGIN
    -- Get the template
    SELECT * INTO v_template
    FROM rate_templates
    WHERE id = template_id;

    -- Get applicable validation rules
    FOR v_rule IN (
        SELECT *
        FROM rate_validation_rules
        WHERE org_id = v_template.org_id
        AND is_active = true
        AND (
            validation_groups IS NULL
            OR validation_groups && validation_groups
            OR validation_groups IS NULL
        )
        AND (
            template_types IS NULL
            OR template_types @> ARRAY[v_template.template_type]
            OR template_types = '{}'::text[]
        )
        ORDER BY priority DESC
    )
    LOOP
        -- Check conditions
        IF check_validation_conditions(v_template, v_rule.conditions) THEN
            -- Validate dependencies
            IF NOT check_validation_dependencies(v_template, v_rule.dependencies) THEN
                v_is_valid = false;
                v_results = v_results || jsonb_build_object(
                    'rule_id', v_rule.id,
                    'field', v_rule.field_name,
                    'type', 'dependency',
                    'message', 'Dependency validation failed'
                );
                CONTINUE;
            END IF;

            -- Perform validation
            DECLARE
                v_validation_result record;
            BEGIN
                SELECT * INTO v_validation_result
                FROM validate_field(
                    v_template,
                    v_rule.field_name,
                    v_rule.rule_type,
                    v_rule.operator,
                    v_rule.value
                );

                IF NOT v_validation_result.is_valid THEN
                    v_is_valid = false;
                    v_results = v_results || jsonb_build_object(
                        'rule_id', v_rule.id,
                        'field', v_rule.field_name,
                        'type', v_rule.rule_type,
                        'message', v_rule.error_message
                    );
                END IF;
            END;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_is_valid, v_results;
END;
$$;

-- Rate forecasting functions
CREATE OR REPLACE FUNCTION generate_rate_forecast(
    forecast_id uuid
)
RETURNS TABLE (
    forecast_date date,
    base_rate decimal,
    final_rate decimal,
    components jsonb
) LANGUAGE plpgsql AS $$
DECLARE
    v_forecast rate_forecasts%ROWTYPE;
    v_template rate_templates%ROWTYPE;
    v_current_date date;
    v_base_rate decimal;
    v_components jsonb;
BEGIN
    -- Get the forecast and template
    SELECT * INTO v_forecast
    FROM rate_forecasts
    WHERE id = forecast_id;

    SELECT * INTO v_template
    FROM rate_templates
    WHERE id = v_forecast.template_id;

    -- Generate forecast dates
    v_current_date := v_forecast.start_date;
    WHILE v_current_date <= v_forecast.end_date LOOP
        -- Calculate forecasted base rate
        v_base_rate := calculate_forecasted_rate(
            v_template.base_rate,
            v_forecast.base_rate_adjustment,
            v_current_date,
            v_forecast.forecast_type,
            v_forecast.assumptions
        );

        -- Calculate components
        v_components := calculate_forecasted_components(
            v_template,
            v_base_rate,
            v_forecast.cost_adjustments,
            v_current_date
        );

        -- Return forecast row
        forecast_date := v_current_date;
        base_rate := v_base_rate;
        final_rate := v_base_rate * (1 + v_forecast.margin_adjustment);
        components := v_components;
        RETURN NEXT;

        -- Increment date based on interval
        v_current_date := v_current_date + 
            CASE v_forecast.interval_type
                WHEN 'weekly' THEN interval '1 week'
                WHEN 'monthly' THEN interval '1 month'
                WHEN 'quarterly' THEN interval '3 months'
                WHEN 'yearly' THEN interval '1 year'
            END;
    END LOOP;
END;
$$;

-- Bulk calculation functions
CREATE OR REPLACE FUNCTION process_bulk_calculations(
    bulk_calc_id uuid
)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_bulk_calc bulk_rate_calculations%ROWTYPE;
    v_template_id uuid;
    v_employee_id uuid;
    v_result record;
    v_results jsonb = '{}'::jsonb;
    v_errors jsonb = '[]'::jsonb;
BEGIN
    -- Get bulk calculation record
    SELECT * INTO v_bulk_calc
    FROM bulk_rate_calculations
    WHERE id = bulk_calc_id;

    -- Update status
    UPDATE bulk_rate_calculations
    SET status = 'processing'
    WHERE id = bulk_calc_id;

    -- Process each template-employee combination
    FOREACH v_template_id IN ARRAY v_bulk_calc.template_ids LOOP
        FOREACH v_employee_id IN ARRAY v_bulk_calc.employee_ids LOOP
            BEGIN
                -- Calculate rate
                SELECT * INTO v_result
                FROM calculate_rate(
                    v_template_id,
                    v_employee_id,
                    (v_bulk_calc.parameters->>'base_rate')::decimal,
                    (v_bulk_calc.parameters->>'casual_loading')::decimal,
                    v_bulk_calc.parameters->'allowances',
                    v_bulk_calc.parameters->'penalties'
                );

                -- Store result
                v_results := v_results || jsonb_build_object(
                    v_template_id || '_' || v_employee_id,
                    to_jsonb(v_result)
                );
            EXCEPTION WHEN OTHERS THEN
                -- Log error
                v_errors := v_errors || jsonb_build_object(
                    'template_id', v_template_id,
                    'employee_id', v_employee_id,
                    'error', SQLERRM
                );
            END;
        END LOOP;
    END LOOP;

    -- Update bulk calculation record
    UPDATE bulk_rate_calculations
    SET
        status = CASE WHEN jsonb_array_length(v_errors) = 0 THEN 'completed' ELSE 'failed' END,
        results = v_results,
        error_log = v_errors,
        completed_at = now()
    WHERE id = bulk_calc_id;
END;
$$;

-- Analytics functions
CREATE OR REPLACE FUNCTION generate_rate_analytics(
    org_id uuid,
    analysis_type text,
    start_date date,
    end_date date,
    dimensions text[] DEFAULT '{}'::text[]
)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
    v_metrics jsonb;
BEGIN
    CASE analysis_type
        WHEN 'cost_distribution' THEN
            SELECT jsonb_build_object(
                'total_cost', SUM(total_cost),
                'cost_breakdown', jsonb_object_agg(
                    component,
                    amount
                )
            )
            INTO v_metrics
            FROM (
                SELECT
                    'super' as component,
                    SUM(super_amount) as amount
                FROM rate_calculations
                WHERE org_id = org_id
                AND calculation_date BETWEEN start_date AND end_date
                UNION ALL
                SELECT
                    'workers_comp',
                    SUM(workers_comp_amount)
                FROM rate_calculations
                WHERE org_id = org_id
                AND calculation_date BETWEEN start_date AND end_date
                -- Add other components
            ) components;

        WHEN 'margin_analysis' THEN
            SELECT jsonb_build_object(
                'average_margin', AVG(margin_amount),
                'margin_distribution', jsonb_object_agg(
                    range,
                    count
                )
            )
            INTO v_metrics
            FROM (
                SELECT
                    CASE
                        WHEN margin_amount < 10 THEN '<10%'
                        WHEN margin_amount < 20 THEN '10-20%'
                        ELSE '>20%'
                    END as range,
                    COUNT(*) as count
                FROM rate_calculations
                WHERE org_id = org_id
                AND calculation_date BETWEEN start_date AND end_date
                GROUP BY range
            ) margins;

        -- Add other analysis types
    END CASE;

    -- Insert analytics record
    INSERT INTO rate_analytics (
        org_id,
        analysis_date,
        analysis_type,
        metrics,
        dimensions
    ) VALUES (
        org_id,
        end_date,
        analysis_type,
        v_metrics,
        dimensions
    );

    RETURN v_metrics;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_forecasts_org
    ON public.rate_forecasts (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_forecasts_template
    ON public.rate_forecasts (template_id);

CREATE INDEX IF NOT EXISTS idx_rate_forecast_results_forecast
    ON public.rate_forecast_results (forecast_id);

CREATE INDEX IF NOT EXISTS idx_bulk_rate_calculations_org
    ON public.bulk_rate_calculations (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_analytics_org
    ON public.rate_analytics (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_reports_org
    ON public.rate_reports (org_id);

-- Enable RLS
ALTER TABLE rate_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_forecast_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_rate_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY rate_forecasts_org_access ON rate_forecasts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_forecasts.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_forecast_results_org_access ON rate_forecast_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM rate_forecasts f
            JOIN user_profiles u ON u.id = auth.uid()
            WHERE f.id = rate_forecast_results.forecast_id
            AND (
                u.organization_id = f.org_id
                OR u.role = 'admin'
            )
        )
    );

CREATE POLICY bulk_rate_calculations_org_access ON bulk_rate_calculations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = bulk_rate_calculations.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_analytics_org_access ON rate_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_analytics.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_reports_org_access ON rate_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_reports.org_id
                OR role = 'admin'
            )
        )
    );
