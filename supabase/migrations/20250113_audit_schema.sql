-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users (id),
    action_type text NOT NULL,
    entity_name text NOT NULL,
    entity_id uuid,
    changes jsonb,
    ip_address text,
    user_agent text,
    session_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_action_type CHECK (
        action_type IN (
            'create',
            'update',
            'delete',
            'login',
            'logout',
            'approve',
            'reject',
            'submit',
            'cancel',
            'archive',
            'restore',
            'bulk_update',
            'bulk_delete'
        )
    ),
    CONSTRAINT valid_entity_name CHECK (
        entity_name IN (
            'employees',
            'timesheets',
            'funding_claims',
            'invoices',
            'documents',
            'qualifications',
            'training_plans',
            'progress_reviews',
            'compliance_records',
            'organizations',
            'users',
            'settings'
        )
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON public.audit_logs (entity_name, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
    ON public.audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON public.audit_logs (action_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
    ON public.audit_logs (created_at DESC);

-- Create function to automatically log changes
CREATE OR REPLACE FUNCTION log_table_change()
RETURNS trigger AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_name,
        entity_id,
        changes,
        ip_address,
        user_agent,
        session_id
    )
    VALUES (
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', row_to_json(NEW)::jsonb)
            WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
                'old', row_to_json(OLD)::jsonb,
                'new', row_to_json(NEW)::jsonb
            )
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old', row_to_json(OLD)::jsonb)
        END,
        current_setting('request.headers')::json->>'x-forwarded-for',
        current_setting('request.headers')::json->>'user-agent',
        current_setting('request.jwt.claims')::json->>'session_id'
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY audit_logs_admin_access ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );
