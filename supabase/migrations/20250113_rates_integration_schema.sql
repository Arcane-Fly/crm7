-- Integration Configurations
CREATE TABLE integration_configs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    integration_type text NOT NULL CHECK (integration_type IN ('payroll', 'hr', 'accounting', 'custom')),
    provider text NOT NULL,
    credentials jsonb,
    settings jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    metadata jsonb
);

-- Integration Sync History
CREATE TABLE integration_sync_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    integration_id uuid REFERENCES integration_configs(id),
    sync_type text NOT NULL CHECK (sync_type IN ('import', 'export')),
    status text NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    records_processed integer DEFAULT 0,
    records_failed integer DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    error_log jsonb,
    metadata jsonb
);

-- Integration Sync Schedule
CREATE TABLE integration_sync_schedules (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    integration_id uuid REFERENCES integration_configs(id),
    schedule_type text NOT NULL CHECK (schedule_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    sync_type text NOT NULL CHECK (sync_type IN ('import', 'export', 'both')),
    last_run timestamp with time zone,
    next_run timestamp with time zone,
    is_active boolean DEFAULT true,
    options jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Functions

-- Sync Rates Function
CREATE OR REPLACE FUNCTION sync_rates(
    p_org_id uuid,
    p_integration_id uuid,
    p_sync_type text,
    p_start_date timestamp with time zone DEFAULT NULL,
    p_end_date timestamp with time zone DEFAULT NULL,
    p_options jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_sync_id uuid;
    v_result jsonb;
BEGIN
    -- Create sync history record
    INSERT INTO integration_sync_history (
        org_id,
        integration_id,
        sync_type,
        status,
        metadata
    )
    VALUES (
        p_org_id,
        p_integration_id,
        p_sync_type,
        'processing',
        jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date,
            'options', p_options
        )
    )
    RETURNING id INTO v_sync_id;

    -- Placeholder for actual sync logic
    UPDATE integration_sync_history
    SET
        status = 'success',
        records_processed = 100,
        records_failed = 0,
        completed_at = now()
    WHERE id = v_sync_id
    RETURNING jsonb_build_object(
        'success', true,
        'records_processed', records_processed,
        'records_failed', records_failed,
        'error_log', error_log
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Validate Integration Function
CREATE OR REPLACE FUNCTION validate_integration(
    p_config jsonb
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Placeholder for validation logic
    SELECT jsonb_build_object(
        'isValid', true,
        'errors', '[]'::jsonb
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Import Rates Function
CREATE OR REPLACE FUNCTION import_rates(
    p_integration_id uuid,
    p_import_type text,
    p_options jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Placeholder for import logic
    SELECT jsonb_build_object(
        'success', true,
        'records_processed', 50,
        'records_failed', 0,
        'error_log', '[]'::jsonb
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Export Rates Function
CREATE OR REPLACE FUNCTION export_rates(
    p_integration_id uuid,
    p_export_type text,
    p_filters jsonb DEFAULT NULL,
    p_options jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Placeholder for export logic
    SELECT jsonb_build_object(
        'success', true,
        'records_processed', 75,
        'records_failed', 0,
        'error_log', '[]'::jsonb
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Schedule Sync Function
CREATE OR REPLACE FUNCTION schedule_rate_sync(
    p_integration_id uuid,
    p_schedule_type text,
    p_sync_type text,
    p_options jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_schedule_id uuid;
    v_next_run timestamp with time zone;
BEGIN
    -- Calculate next run based on schedule type
    SELECT
        CASE p_schedule_type
            WHEN 'hourly' THEN date_trunc('hour', now()) + interval '1 hour'
            WHEN 'daily' THEN date_trunc('day', now()) + interval '1 day'
            WHEN 'weekly' THEN date_trunc('week', now()) + interval '1 week'
            WHEN 'monthly' THEN date_trunc('month', now()) + interval '1 month'
        END
    INTO v_next_run;

    -- Create schedule
    INSERT INTO integration_sync_schedules (
        integration_id,
        schedule_type,
        sync_type,
        next_run,
        options
    )
    VALUES (
        p_integration_id,
        p_schedule_type,
        p_sync_type,
        v_next_run,
        p_options
    )
    RETURNING id INTO v_schedule_id;

    RETURN jsonb_build_object(
        'schedule_id', v_schedule_id,
        'next_run', v_next_run
    );
END;
$$;

-- Get Integration Status Function
CREATE OR REPLACE FUNCTION get_integration_status(
    p_integration_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'is_connected', true,
        'last_sync', (
            SELECT completed_at
            FROM integration_sync_history
            WHERE integration_id = p_integration_id
            AND status = 'success'
            ORDER BY completed_at DESC
            LIMIT 1
        ),
        'next_sync', (
            SELECT next_run
            FROM integration_sync_schedules
            WHERE integration_id = p_integration_id
            AND is_active = true
            ORDER BY next_run ASC
            LIMIT 1
        ),
        'metadata', jsonb_build_object(
            'total_syncs', (
                SELECT count(*)
                FROM integration_sync_history
                WHERE integration_id = p_integration_id
            ),
            'success_rate', (
                SELECT 
                    ROUND(
                        (COUNT(*) FILTER (WHERE status = 'success')::numeric / 
                        NULLIF(COUNT(*), 0)::numeric) * 100, 
                        2
                    )
                FROM integration_sync_history
                WHERE integration_id = p_integration_id
            )
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Indexes
CREATE INDEX idx_integration_configs_org ON integration_configs(org_id);
CREATE INDEX idx_integration_sync_history_org_integration ON integration_sync_history(org_id, integration_id);
CREATE INDEX idx_integration_sync_schedules_integration ON integration_sync_schedules(integration_id);

-- RLS Policies
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY integration_configs_org_access ON integration_configs
    USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY integration_sync_history_org_access ON integration_sync_history
    USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY integration_sync_schedules_org_access ON integration_sync_schedules
    USING (org_id = auth.jwt() ->> 'org_id'::text);
