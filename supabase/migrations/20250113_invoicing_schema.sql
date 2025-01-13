-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL,
    org_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    host_employer_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL,
    invoice_date date NOT NULL,
    due_date date,
    currency text DEFAULT 'AUD',
    subtotal_amount numeric(12,2),
    tax_amount numeric(12,2),
    total_amount numeric(12,2),
    status text DEFAULT 'unpaid',
    reference_number text,
    notes text,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
    description text NOT NULL,
    quantity numeric(10,2) DEFAULT 1.0,
    unit_price numeric(10,2),
    tax_rate numeric(5,2),
    line_subtotal numeric(12,2),
    line_tax_amount numeric(12,2),
    line_total numeric(12,2),
    timesheet_id uuid REFERENCES public.timesheets (id) ON DELETE SET NULL,
    placement_id uuid REFERENCES public.jobs (id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
    payment_date timestamptz NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method text,
    reference text,
    notes text,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Credit notes
CREATE TABLE IF NOT EXISTS public.credit_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
    credit_number text NOT NULL,
    credit_date date NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS invoices_unique_invoice_number ON public.invoices (invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices (org_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_host ON public.invoices (host_employer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_line_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments (invoice_id);

-- Create invoice number generation function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
    year text;
    sequence int;
    new_invoice_number text;
BEGIN
    year := to_char(current_date, 'YYYY');
    
    -- Get the next sequence number for this year
    WITH next_seq AS (
        SELECT COALESCE(MAX(NULLIF(regexp_replace(invoice_number, '^INV-\d{4}-', ''), '')), '0')::int + 1 as next
        FROM invoices
        WHERE invoice_number LIKE 'INV-' || year || '-%'
    )
    SELECT next INTO sequence FROM next_seq;
    
    -- Format: INV-2025-00001
    new_invoice_number := 'INV-' || year || '-' || LPAD(sequence::text, 5, '0');
    
    RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice number generation
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- Create function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS trigger AS $$
DECLARE
    total_paid numeric(12,2);
    invoice_total numeric(12,2);
BEGIN
    -- Get total amount paid
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments
    WHERE invoice_id = NEW.invoice_id;
    
    -- Get invoice total amount
    SELECT total_amount INTO invoice_total
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    -- Update invoice status
    UPDATE invoices
    SET status = CASE
        WHEN total_paid >= invoice_total THEN 'paid'
        WHEN total_paid > 0 THEN 'partially_paid'
        ELSE 'unpaid'
    END,
    updated_at = now()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_status
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_status();

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS trigger AS $$
DECLARE
    new_subtotal numeric(12,2);
    new_tax_amount numeric(12,2);
BEGIN
    -- Calculate new totals
    SELECT 
        COALESCE(SUM(line_subtotal), 0),
        COALESCE(SUM(line_tax_amount), 0)
    INTO new_subtotal, new_tax_amount
    FROM invoice_line_items
    WHERE invoice_id = NEW.invoice_id;
    
    -- Update invoice
    UPDATE invoices
    SET 
        subtotal_amount = new_subtotal,
        tax_amount = new_tax_amount,
        total_amount = new_subtotal + new_tax_amount,
        updated_at = now()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Row Level Security Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY invoice_org_access ON invoices
    FOR ALL USING (org_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    ));

CREATE POLICY invoice_items_access ON invoice_line_items
    FOR ALL USING (invoice_id IN (
        SELECT id FROM invoices WHERE org_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    ));
