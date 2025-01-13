-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funding Programs
CREATE TABLE IF NOT EXISTS public.funding_programs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    eligibility_criteria jsonb DEFAULT '{}'::jsonb,
    contact_info jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Funding Claims
CREATE TABLE IF NOT EXISTS public.funding_claims (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id uuid REFERENCES public.funding_programs (id) ON DELETE SET NULL,
    employee_id uuid NOT NULL REFERENCES public.employees (id) ON DELETE CASCADE,
    host_employer_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL,
    claim_status text DEFAULT 'pending',
    amount_claimed numeric(12,2),
    date_submitted date DEFAULT CURRENT_DATE,
    date_approved date,
    reference_number text,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_claim_status CHECK (claim_status IN ('pending', 'approved', 'rejected', 'paid', 'cancelled'))
);

-- Funding Claim Documents
CREATE TABLE IF NOT EXISTS public.funding_claim_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funding_claim_id uuid NOT NULL REFERENCES public.funding_claims (id) ON DELETE CASCADE,
    document_type text NOT NULL,
    file_url text NOT NULL,
    file_name text,
    file_size integer,
    content_type text,
    uploaded_by uuid REFERENCES auth.users (id),
    metadata jsonb DEFAULT '{}'::jsonb,
    uploaded_at timestamptz DEFAULT now()
);

-- Funding Claim Approvals
CREATE TABLE IF NOT EXISTS public.funding_claim_approvals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funding_claim_id uuid NOT NULL REFERENCES public.funding_claims (id) ON DELETE CASCADE,
    approver_id uuid REFERENCES auth.users (id),
    approval_date timestamptz,
    approval_status text DEFAULT 'pending',
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected', 'resubmitted'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_funding_claims_employee ON public.funding_claims (employee_id);
CREATE INDEX IF NOT EXISTS idx_funding_claims_host ON public.funding_claims (host_employer_id);
CREATE INDEX IF NOT EXISTS idx_funding_claims_status ON public.funding_claims (claim_status);
CREATE INDEX IF NOT EXISTS idx_funding_claim_docs ON public.funding_claim_documents (funding_claim_id);
CREATE INDEX IF NOT EXISTS idx_funding_claim_approvals ON public.funding_claim_approvals (funding_claim_id);

-- Create function to update claim status based on approvals
CREATE OR REPLACE FUNCTION update_claim_status()
RETURNS trigger AS $$
DECLARE
    all_approved boolean;
BEGIN
    -- Check if all approvals are completed
    SELECT bool_and(approval_status = 'approved') INTO all_approved
    FROM funding_claim_approvals
    WHERE funding_claim_id = NEW.funding_claim_id;

    IF all_approved THEN
        UPDATE funding_claims
        SET claim_status = 'approved',
            date_approved = CURRENT_DATE,
            updated_at = now()
        WHERE id = NEW.funding_claim_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating claim status
CREATE TRIGGER trigger_update_claim_status
    AFTER INSERT OR UPDATE ON funding_claim_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_status();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER set_timestamp_funding_programs
    BEFORE UPDATE ON funding_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_funding_claims
    BEFORE UPDATE ON funding_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_funding_claim_approvals
    BEFORE UPDATE ON funding_claim_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE funding_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_claim_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY funding_programs_org_access ON funding_programs
    FOR ALL USING (true);  -- Viewable by all authenticated users

CREATE POLICY funding_claims_org_access ON funding_claims
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id IN (
                    SELECT id FROM organizations
                    WHERE id = funding_claims.host_employer_id
                )
                OR
                role = 'admin'
            )
        )
    );

CREATE POLICY funding_claim_documents_org_access ON funding_claim_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM funding_claims fc
            JOIN user_profiles up ON up.id = auth.uid()
            WHERE fc.id = funding_claim_documents.funding_claim_id
            AND (
                up.organization_id = fc.host_employer_id
                OR up.role = 'admin'
            )
        )
    );

CREATE POLICY funding_claim_approvals_org_access ON funding_claim_approvals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM funding_claims fc
            JOIN user_profiles up ON up.id = auth.uid()
            WHERE fc.id = funding_claim_approvals.funding_claim_id
            AND (
                up.organization_id = fc.host_employer_id
                OR up.role = 'admin'
            )
        )
    );
