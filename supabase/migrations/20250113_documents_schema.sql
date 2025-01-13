-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    linked_object_type text NOT NULL,
    linked_object_id uuid NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    uploaded_by uuid REFERENCES auth.users (id),
    uploaded_at timestamptz DEFAULT now(),
    file_size bigint,
    mime_type text,
    version_number int DEFAULT 1,
    document_type text,
    tags jsonb DEFAULT '[]'::jsonb,
    thumbnail_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active',
    org_id uuid REFERENCES public.organizations (id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_document_status CHECK (
        status IN ('active', 'archived', 'deleted')
    ),
    CONSTRAINT valid_linked_object_type CHECK (
        linked_object_type IN (
            'employees',
            'timesheets',
            'licences',
            'funding_claims',
            'invoices',
            'qualifications',
            'training_plans',
            'progress_reviews',
            'compliance_records'
        )
    )
);

-- Document versions table for version history
CREATE TABLE IF NOT EXISTS public.document_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    mime_type text,
    version_number int NOT NULL,
    uploaded_by uuid REFERENCES auth.users (id),
    uploaded_at timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Document access logs for audit trail
CREATE TABLE IF NOT EXISTS public.document_access_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users (id),
    access_type text NOT NULL,
    accessed_at timestamptz DEFAULT now(),
    ip_address text,
    user_agent text,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT valid_access_type CHECK (
        access_type IN ('view', 'download', 'upload', 'delete', 'update')
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_linked_object
    ON public.documents (linked_object_type, linked_object_id);

CREATE INDEX IF NOT EXISTS idx_documents_org
    ON public.documents (org_id);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by
    ON public.documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_document_versions_document
    ON public.document_versions (document_id);

CREATE INDEX IF NOT EXISTS idx_document_access_logs_document
    ON public.document_access_logs (document_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE TRIGGER set_timestamp_documents
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_document_updated_at();

-- Create function to log document access
CREATE OR REPLACE FUNCTION log_document_access()
RETURNS trigger AS $$
BEGIN
    INSERT INTO document_access_logs (
        document_id,
        user_id,
        access_type,
        ip_address,
        user_agent
    )
    VALUES (
        NEW.id,
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'upload'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        current_setting('request.headers')::json->>'x-forwarded-for',
        current_setting('request.headers')::json->>'user-agent'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for document access logging
CREATE TRIGGER trigger_log_document_access
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION log_document_access();

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY documents_org_access ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND (
                organization_id = documents.org_id
                OR role = 'admin'
            )
        )
    );

CREATE POLICY document_versions_org_access ON document_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM documents d
            JOIN user_profiles up ON up.id = auth.uid()
            WHERE d.id = document_versions.document_id
            AND (
                up.organization_id = d.org_id
                OR up.role = 'admin'
            )
        )
    );

CREATE POLICY document_access_logs_org_access ON document_access_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM documents d
            JOIN user_profiles up ON up.id = auth.uid()
            WHERE d.id = document_access_logs.document_id
            AND (
                up.organization_id = d.org_id
                OR up.role = 'admin'
            )
        )
    );
