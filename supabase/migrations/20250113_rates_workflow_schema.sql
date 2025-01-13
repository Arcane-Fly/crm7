-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rate template approvals table
CREATE TABLE IF NOT EXISTS public.rate_template_approvals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.rate_templates (id),
    org_id uuid REFERENCES public.organizations (id),
    requested_by uuid REFERENCES auth.users (id),
    approved_by uuid REFERENCES auth.users (id),
    status text NOT NULL DEFAULT 'pending',
    changes jsonb NOT NULL,
    notes text,
    requested_at timestamptz DEFAULT now(),
    approved_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_approval_status CHECK (
        status IN ('pending', 'approved', 'rejected')
    )
);

-- Rate template history table
CREATE TABLE IF NOT EXISTS public.rate_template_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.rate_templates (id),
    org_id uuid REFERENCES public.organizations (id),
    modified_by uuid REFERENCES auth.users (id),
    action text NOT NULL,
    changes jsonb NOT NULL,
    version_number int NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_history_action CHECK (
        action IN ('created', 'updated', 'deleted', 'approved', 'rejected')
    )
);

-- Rate calculation history table
CREATE TABLE IF NOT EXISTS public.rate_calculation_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    calculation_id uuid REFERENCES public.rate_calculations (id),
    org_id uuid REFERENCES public.organizations (id),
    employee_id uuid REFERENCES public.employees (id),
    template_id uuid REFERENCES public.rate_templates (id),
    calculated_by uuid REFERENCES auth.users (id),
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
    created_at timestamptz DEFAULT now()
);

-- Rate validation rules table
CREATE TABLE IF NOT EXISTS public.rate_validation_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id),
    rule_name text NOT NULL,
    rule_type text NOT NULL,
    field_name text NOT NULL,
    operator text NOT NULL,
    value jsonb NOT NULL,
    error_message text NOT NULL,
    is_active boolean DEFAULT true,
    priority int DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_rule_type CHECK (
        rule_type IN ('range', 'required', 'comparison', 'custom')
    ),
    CONSTRAINT valid_operator CHECK (
        operator IN ('eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'between')
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_template_approvals_template
    ON public.rate_template_approvals (template_id);

CREATE INDEX IF NOT EXISTS idx_rate_template_approvals_org
    ON public.rate_template_approvals (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_template_approvals_status
    ON public.rate_template_approvals (status);

CREATE INDEX IF NOT EXISTS idx_rate_template_history_template
    ON public.rate_template_history (template_id);

CREATE INDEX IF NOT EXISTS idx_rate_template_history_org
    ON public.rate_template_history (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_calculation_history_calculation
    ON public.rate_calculation_history (calculation_id);

CREATE INDEX IF NOT EXISTS idx_rate_calculation_history_org
    ON public.rate_calculation_history (org_id);

CREATE INDEX IF NOT EXISTS idx_rate_calculation_history_employee
    ON public.rate_calculation_history (employee_id);

CREATE INDEX IF NOT EXISTS idx_rate_validation_rules_org
    ON public.rate_validation_rules (org_id);

-- Create function to track rate template changes
CREATE OR REPLACE FUNCTION track_rate_template_changes()
RETURNS trigger AS $$
BEGIN
    INSERT INTO rate_template_history (
        template_id,
        org_id,
        modified_by,
        action,
        changes,
        version_number,
        effective_from,
        effective_to
    ) VALUES (
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.org_id
            ELSE NEW.org_id
        END,
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        CASE
            WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
            WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
                'old', to_jsonb(OLD),
                'new', to_jsonb(NEW)
            )
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.version_number
            ELSE NEW.version_number
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.effective_from
            ELSE NEW.effective_from
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.effective_to
            ELSE NEW.effective_to
        END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to track rate calculations
CREATE OR REPLACE FUNCTION track_rate_calculations()
RETURNS trigger AS $$
BEGIN
    INSERT INTO rate_calculation_history (
        calculation_id,
        org_id,
        employee_id,
        template_id,
        calculated_by,
        base_rate,
        casual_loading,
        allowances,
        penalties,
        super_amount,
        leave_loading_amount,
        workers_comp_amount,
        payroll_tax_amount,
        training_cost_amount,
        other_costs_amount,
        funding_offset_amount,
        margin_amount,
        total_cost,
        final_rate,
        calculation_date,
        metadata
    ) VALUES (
        NEW.id,
        NEW.org_id,
        NEW.employee_id,
        NEW.template_id,
        auth.uid(),
        NEW.base_rate,
        NEW.casual_loading,
        NEW.allowances,
        NEW.penalties,
        NEW.super_amount,
        NEW.leave_loading_amount,
        NEW.workers_comp_amount,
        NEW.payroll_tax_amount,
        NEW.training_cost_amount,
        NEW.other_costs_amount,
        NEW.funding_offset_amount,
        NEW.margin_amount,
        NEW.total_cost,
        NEW.final_rate,
        NEW.calculation_date,
        NEW.metadata
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER track_rate_template_changes
    AFTER INSERT OR UPDATE OR DELETE ON rate_templates
    FOR EACH ROW
    EXECUTE FUNCTION track_rate_template_changes();

CREATE TRIGGER track_rate_calculations
    AFTER INSERT ON rate_calculations
    FOR EACH ROW
    EXECUTE FUNCTION track_rate_calculations();

-- Enable Row Level Security
ALTER TABLE rate_template_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_template_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_calculation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_validation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY rate_template_approvals_org_access ON rate_template_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_template_approvals.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_template_history_org_access ON rate_template_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_template_history.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_calculation_history_org_access ON rate_calculation_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_calculation_history.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY rate_validation_rules_org_access ON rate_validation_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = rate_validation_rules.org_id
                OR role = 'admin'
            )
        )
    );
