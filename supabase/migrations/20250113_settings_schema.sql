-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    category text NOT NULL,
    is_encrypted boolean DEFAULT false,
    is_required boolean DEFAULT false,
    validation_rules jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_setting_category CHECK (
        category IN (
            'general',
            'security',
            'notifications',
            'integrations',
            'compliance',
            'billing',
            'features',
            'customization'
        )
    )
);

-- Create unique constraint for org + key
CREATE UNIQUE INDEX IF NOT EXISTS system_settings_org_key_unique
    ON public.system_settings (org_id, key)
    WHERE org_id IS NOT NULL;

-- Create unique constraint for global settings
CREATE UNIQUE INDEX IF NOT EXISTS system_settings_global_key_unique
    ON public.system_settings (key)
    WHERE org_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_category
    ON public.system_settings (category);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_setting_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER set_timestamp_system_settings
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_setting_updated_at();

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY system_settings_org_access ON system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = system_settings.org_id
                OR system_settings.org_id IS NULL
            )
        )
    );

CREATE POLICY system_settings_admin_access ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO system_settings (key, value, description, category, is_required)
VALUES
    ('app.name', '"CRM7R"'::jsonb, 'Application name', 'general', true),
    ('app.timezone', '"Australia/Sydney"'::jsonb, 'Default timezone for system timestamps', 'general', true),
    ('app.date_format', '"DD/MM/YYYY"'::jsonb, 'Default date format', 'general', true),
    ('app.time_format', '"HH:mm"'::jsonb, 'Default time format', 'general', true),
    ('security.session_timeout', '3600'::jsonb, 'Session timeout in seconds', 'security', true),
    ('security.password_policy', '{"min_length": 8, "require_numbers": true, "require_special": true}'::jsonb, 'Password policy settings', 'security', true),
    ('notifications.email_enabled', 'true'::jsonb, 'Enable email notifications', 'notifications', true),
    ('notifications.sms_enabled', 'false'::jsonb, 'Enable SMS notifications', 'notifications', false),
    ('compliance.retention_period', '7'::jsonb, 'Document retention period in years', 'compliance', true),
    ('features.enable_shift_bidding', 'false'::jsonb, 'Enable shift bidding feature', 'features', false),
    ('features.enable_auto_scheduling', 'false'::jsonb, 'Enable automatic scheduling', 'features', false),
    ('billing.tax_rate', '10'::jsonb, 'Default tax rate percentage', 'billing', true),
    ('billing.payment_terms', '14'::jsonb, 'Default payment terms in days', 'billing', true)
ON CONFLICT (key) WHERE org_id IS NULL DO UPDATE
SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_required = EXCLUDED.is_required;
