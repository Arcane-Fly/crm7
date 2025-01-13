-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Integration Settings
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
    integration_type text NOT NULL,
    api_key text,
    configuration jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_integration_type CHECK (
        integration_type IN (
            'payroll',
            'government_portal',
            'rto_system',
            'job_board',
            'together_ai',
            'perplexity',
            'fairwork'
        )
    )
);

-- Create index for active integrations
CREATE INDEX IF NOT EXISTS idx_integration_settings_active
    ON public.integration_settings (integration_type)
    WHERE is_active = true;

-- Create index for organization integrations
CREATE INDEX IF NOT EXISTS idx_integration_settings_org
    ON public.integration_settings (org_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER set_timestamp_integration_settings
    BEFORE UPDATE ON integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

-- Enable Row Level Security
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY integration_settings_org_access ON integration_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = integration_settings.org_id
                OR role = 'admin'
            )
        )
    );
