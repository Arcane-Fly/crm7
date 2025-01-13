-- Drop existing basic policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON integration_logs;
DROP POLICY IF EXISTS "Allow authenticated read access" ON time_entries;
DROP POLICY IF EXISTS "Allow authenticated read access" ON documents;
DROP POLICY IF EXISTS "Allow authenticated read access" ON email_templates;
DROP POLICY IF EXISTS "Allow authenticated read access" ON quotes;
DROP POLICY IF EXISTS "Allow authenticated read access" ON reports;

-- Integration Logs Policies
CREATE POLICY "View own integration logs" ON integration_logs
    FOR SELECT TO authenticated
    USING (metadata->>'user_id' = auth.uid()::text);

CREATE POLICY "Create own integration logs" ON integration_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Time Entries Policies
CREATE POLICY "View own time entries" ON time_entries
    FOR SELECT TO authenticated
    USING (employee_id::text = auth.uid()::text);

CREATE POLICY "Create own time entries" ON time_entries
    FOR INSERT TO authenticated
    WITH CHECK (employee_id::text = auth.uid()::text);

CREATE POLICY "Update own time entries" ON time_entries
    FOR UPDATE TO authenticated
    USING (employee_id::text = auth.uid()::text)
    WITH CHECK (employee_id::text = auth.uid()::text);

-- Documents Policies
CREATE POLICY "View accessible documents" ON documents
    FOR SELECT TO authenticated
    USING (
        created_by::text = auth.uid()::text
        OR (metadata->'shared_with')::jsonb ? auth.uid()::text
    );

CREATE POLICY "Create own documents" ON documents
    FOR INSERT TO authenticated
    WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Update own documents" ON documents
    FOR UPDATE TO authenticated
    USING (created_by::text = auth.uid()::text)
    WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Delete own documents" ON documents
    FOR DELETE TO authenticated
    USING (created_by::text = auth.uid()::text);

-- Email Templates Policies
CREATE POLICY "View email templates" ON email_templates
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Manage email templates" ON email_templates
    FOR ALL TO authenticated
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Quotes Policies
CREATE POLICY "View own quotes" ON quotes
    FOR SELECT TO authenticated
    USING (
        client_id::text = auth.uid()::text
        OR metadata->>'created_by' = auth.uid()::text
    );

CREATE POLICY "Create quotes" ON quotes
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Update own quotes" ON quotes
    FOR UPDATE TO authenticated
    USING (metadata->>'created_by' = auth.uid()::text)
    WITH CHECK (metadata->>'created_by' = auth.uid()::text);

-- Reports Policies
CREATE POLICY "View reports" ON reports
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Manage reports" ON reports
    FOR ALL TO authenticated
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');
