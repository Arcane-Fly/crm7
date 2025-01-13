-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Award rates table
CREATE TABLE IF NOT EXISTS public.award_rates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    award_code text NOT NULL,
    award_name text NOT NULL,
    classification_code text NOT NULL,
    classification_name text NOT NULL,
    level text,
    year_of_apprenticeship int,
    base_rate decimal(10,2) NOT NULL,
    casual_loading decimal(5,2),
    super_rate decimal(5,2),
    leave_loading decimal(5,2),
    effective_from date NOT NULL,
    effective_to date,
    published_year int NOT NULL,
    version_number int DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_year_of_apprenticeship CHECK (
        year_of_apprenticeship BETWEEN 1 AND 4
    )
);

-- Allowances table
CREATE TABLE IF NOT EXISTS public.allowances (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    award_id uuid REFERENCES public.award_rates (id),
    allowance_code text NOT NULL,
    allowance_name text NOT NULL,
    allowance_type text NOT NULL,
    amount decimal(10,2) NOT NULL,
    calculation_type text NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    published_year int NOT NULL,
    version_number int DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_allowance_type CHECK (
        allowance_type IN ('wage', 'expense', 'travel', 'meal', 'tool', 'other')
    ),
    CONSTRAINT valid_calculation_type CHECK (
        calculation_type IN ('fixed', 'hourly', 'daily', 'weekly', 'percentage')
    )
);

-- Penalties table
CREATE TABLE IF NOT EXISTS public.penalties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    award_id uuid REFERENCES public.award_rates (id),
    penalty_code text NOT NULL,
    penalty_name text NOT NULL,
    penalty_type text NOT NULL,
    multiplier decimal(5,2) NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    published_year int NOT NULL,
    version_number int DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_penalty_type CHECK (
        penalty_type IN ('overtime', 'weekend', 'public_holiday', 'shift', 'other')
    )
);

-- Rate templates table
CREATE TABLE IF NOT EXISTS public.rate_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name text NOT NULL,
    template_type text NOT NULL,
    award_id uuid REFERENCES public.award_rates (id),
    org_id uuid REFERENCES public.organizations (id),
    base_margin decimal(5,2) NOT NULL,
    super_rate decimal(5,2) NOT NULL,
    leave_loading decimal(5,2),
    workers_comp_rate decimal(5,2),
    payroll_tax_rate decimal(5,2),
    training_cost_rate decimal(5,2),
    other_costs_rate decimal(5,2),
    funding_offset decimal(10,2),
    rules jsonb NOT NULL,
    is_active boolean DEFAULT true,
    effective_from date NOT NULL,
    effective_to date,
    version_number int DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_template_type CHECK (
        template_type IN ('apprentice', 'trainee', 'casual', 'permanent', 'contractor')
    )
);

-- Rate calculations table
CREATE TABLE IF NOT EXISTS public.rate_calculations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.rate_templates (id),
    org_id uuid REFERENCES public.organizations (id),
    employee_id uuid REFERENCES public.employees (id),
    base_rate decimal(10,2) NOT NULL,
    casual_loading decimal(10,2),
    allowances jsonb DEFAULT '[]'::jsonb,
    penalties jsonb DEFAULT '[]'::jsonb,
    super_amount decimal(10,2) NOT NULL,
    leave_loading_amount decimal(10,2),
    workers_comp_amount decimal(10,2),
    payroll_tax_amount decimal(10,2),
    training_cost_amount decimal(10,2),
    other_costs_amount decimal(10,2),
    funding_offset_amount decimal(10,2),
    margin_amount decimal(10,2) NOT NULL,
    total_cost decimal(10,2) NOT NULL,
    final_rate decimal(10,2) NOT NULL,
    calculation_date date NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_award_rates_code
    ON public.award_rates (award_code);

CREATE INDEX IF NOT EXISTS idx_award_rates_effective
    ON public.award_rates (effective_from, effective_to);

CREATE INDEX IF NOT EXISTS idx_allowances_award
    ON public.allowances (award_id);

CREATE INDEX IF NOT EXISTS idx_penalties_award
    ON public.penalties (award_id);

CREATE INDEX IF NOT EXISTS idx_rate_templates_org
    ON public.rate_templates (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_calculations_org
    ON public.rate_calculations (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_calculations_employee
    ON public.rate_calculations (employee_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_rates_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER set_timestamp_award_rates
    BEFORE UPDATE ON award_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_rates_updated_at();

CREATE TRIGGER set_timestamp_allowances
    BEFORE UPDATE ON allowances
    FOR EACH ROW
    EXECUTE FUNCTION update_rates_updated_at();

CREATE TRIGGER set_timestamp_penalties
    BEFORE UPDATE ON penalties
    FOR EACH ROW
    EXECUTE FUNCTION update_rates_updated_at();

CREATE TRIGGER set_timestamp_rate_templates
    BEFORE UPDATE ON rate_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_rates_updated_at();

CREATE TRIGGER set_timestamp_rate_calculations
    BEFORE UPDATE ON rate_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_rates_updated_at();

-- Enable Row Level Security
ALTER TABLE award_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY award_rates_read_access ON award_rates
    FOR SELECT USING (true);

CREATE POLICY allowances_read_access ON allowances
    FOR SELECT USING (true);

CREATE POLICY penalties_read_access ON penalties
    FOR SELECT USING (true);

CREATE POLICY rate_templates_org_access ON rate_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_templates.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_calculations_org_access ON rate_calculations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_calculations.org_id
                OR role = 'admin'
            )
        )
    );
