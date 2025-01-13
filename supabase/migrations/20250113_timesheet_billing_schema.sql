-- Timesheet and Billing Schema

-- Timesheets table to track worked hours
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    host_employer_id UUID NOT NULL REFERENCES organizations(id),
    rate_template_id UUID NOT NULL REFERENCES rate_templates(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'billed')),
    total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    regular_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    break_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
    allowances JSONB DEFAULT '[]',
    penalties JSONB DEFAULT '[]',
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Timesheet entries for detailed time tracking
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0, -- in minutes
    work_type VARCHAR(50) NOT NULL DEFAULT 'regular',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Invoices table for billing host employers
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_employer_id UUID NOT NULL REFERENCES organizations(id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Invoice line items
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id),
    employee_id UUID NOT NULL REFERENCES auth.users(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    metadata JSONB
);

-- Billing settings for organizations
CREATE TABLE billing_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    billing_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly' CHECK (billing_frequency IN ('weekly', 'fortnightly', 'monthly')),
    payment_terms INTEGER NOT NULL DEFAULT 14, -- days
    auto_generate_invoices BOOLEAN NOT NULL DEFAULT true,
    auto_send_invoices BOOLEAN NOT NULL DEFAULT false,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    invoice_template JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Functions for timesheet and billing automation

-- Function to calculate timesheet hours
CREATE OR REPLACE FUNCTION calculate_timesheet_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total hours from entries
    WITH hour_calcs AS (
        SELECT 
            SUM(
                EXTRACT(EPOCH FROM (end_time - start_time))/3600 - 
                (break_duration/60.0)
            ) as total_hours,
            SUM(
                CASE WHEN work_type = 'regular' 
                THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600 - 
                     (break_duration/60.0)
                ELSE 0 
                END
            ) as regular_hours,
            SUM(
                CASE WHEN work_type = 'overtime' 
                THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600 - 
                     (break_duration/60.0)
                ELSE 0 
                END
            ) as overtime_hours,
            SUM(break_duration/60.0) as break_hours
        FROM timesheet_entries
        WHERE timesheet_id = NEW.timesheet_id
    )
    UPDATE timesheets
    SET 
        total_hours = hour_calcs.total_hours,
        regular_hours = hour_calcs.regular_hours,
        overtime_hours = hour_calcs.overtime_hours,
        break_hours = hour_calcs.break_hours,
        updated_at = CURRENT_TIMESTAMP
    FROM hour_calcs
    WHERE id = NEW.timesheet_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timesheet hours when entries change
CREATE TRIGGER update_timesheet_hours
AFTER INSERT OR UPDATE OR DELETE ON timesheet_entries
FOR EACH ROW EXECUTE FUNCTION calculate_timesheet_hours();

-- Function to generate invoice from timesheets
CREATE OR REPLACE FUNCTION generate_invoice(
    p_host_employer_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_billing_settings billing_settings%ROWTYPE;
    v_due_date DATE;
    v_subtotal DECIMAL(10,2) := 0;
BEGIN
    -- Get billing settings
    SELECT * INTO v_billing_settings
    FROM billing_settings
    WHERE org_id = p_host_employer_id;
    
    -- Calculate due date
    v_due_date := p_end_date + (v_billing_settings.payment_terms || ' days')::INTERVAL;
    
    -- Create invoice
    INSERT INTO invoices (
        host_employer_id,
        billing_period_start,
        billing_period_end,
        status,
        due_date,
        metadata
    ) VALUES (
        p_host_employer_id,
        p_start_date,
        p_end_date,
        'draft',
        v_due_date,
        jsonb_build_object('auto_generated', true)
    ) RETURNING id INTO v_invoice_id;
    
    -- Insert line items from approved timesheets
    WITH calculations AS (
        SELECT 
            t.id as timesheet_id,
            t.employee_id,
            t.total_hours,
            t.regular_hours,
            t.overtime_hours,
            rc.final_rate,
            (t.regular_hours * rc.final_rate + 
             t.overtime_hours * rc.final_rate * 1.5) as amount
        FROM timesheets t
        CROSS JOIN LATERAL (
            SELECT * FROM calculate_rate(
                p_template_id := t.rate_template_id,
                p_employee_id := t.employee_id,
                p_base_rate := (
                    SELECT base_rate 
                    FROM rate_templates 
                    WHERE id = t.rate_template_id
                ),
                p_allowances := t.allowances,
                p_penalties := t.penalties
            )
        ) rc
        WHERE t.host_employer_id = p_host_employer_id
        AND t.start_date >= p_start_date
        AND t.end_date <= p_end_date
        AND t.status = 'approved'
    )
    INSERT INTO invoice_line_items (
        invoice_id,
        timesheet_id,
        employee_id,
        description,
        quantity,
        unit_price,
        amount
    )
    SELECT 
        v_invoice_id,
        timesheet_id,
        employee_id,
        'Labor charges for ' || to_char(p_start_date, 'Mon DD') || ' - ' || to_char(p_end_date, 'Mon DD'),
        total_hours,
        final_rate,
        amount
    FROM calculations;
    
    -- Update invoice totals
    UPDATE invoices
    SET 
        subtotal = (
            SELECT COALESCE(SUM(amount), 0)
            FROM invoice_line_items
            WHERE invoice_id = v_invoice_id
        ),
        tax_amount = (
            SELECT COALESCE(SUM(amount), 0) * (v_billing_settings.tax_rate / 100)
            FROM invoice_line_items
            WHERE invoice_id = v_invoice_id
        ),
        total_amount = (
            SELECT COALESCE(SUM(amount), 0) * (1 + v_billing_settings.tax_rate / 100)
            FROM invoice_line_items
            WHERE invoice_id = v_invoice_id
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_invoice_id;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
