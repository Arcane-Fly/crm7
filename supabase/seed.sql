-- Seed data for testing

-- Email Templates
INSERT INTO email_templates (name, subject, body, variables) VALUES
('welcome_email', 'Welcome to Our Platform', 'Hi {{name}},\n\nWelcome to our platform!', '{"name": "string"}'),
('quote_notification', 'New Quote Available', 'Hi {{client_name}},\n\nA new quote for {{amount}} is available.', '{"client_name": "string", "amount": "number"}'),
('report_ready', 'Your Report is Ready', 'Hi {{name}},\n\nYour {{report_type}} report is ready for viewing.', '{"name": "string", "report_type": "string"}');

-- Integration Logs
INSERT INTO integration_logs (integration_type, status, message, metadata) VALUES
('fairwork_api', 'success', 'Successfully fetched award rates', '{"user_id": "test-user-1", "request_id": "123"}'),
('email_service', 'error', 'Failed to send welcome email', '{"user_id": "test-user-2", "error_code": "EMAIL_001"}'),
('document_storage', 'success', 'Document uploaded successfully', '{"user_id": "test-user-1", "file_id": "doc-123"}');

-- Time Entries
INSERT INTO time_entries (employee_id, start_time, end_time, break_duration, status, overtime_minutes) VALUES
('11111111-1111-1111-1111-111111111111', '2025-01-13 09:00:00+08', '2025-01-13 17:00:00+08', 30, 'approved', 0),
('22222222-2222-2222-2222-222222222222', '2025-01-13 08:30:00+08', '2025-01-13 18:30:00+08', 60, 'pending', 120),
('33333333-3333-3333-3333-333333333333', '2025-01-13 09:00:00+08', '2025-01-13 17:00:00+08', 45, 'approved', 0);

-- Documents
INSERT INTO documents (name, file_path, mime_type, size_bytes, metadata, created_by) VALUES
('Employee Handbook', '/documents/handbook.pdf', 'application/pdf', 1048576, '{"department": "HR", "version": "1.0"}', '11111111-1111-1111-1111-111111111111'),
('Training Manual', '/documents/training.pdf', 'application/pdf', 2097152, '{"department": "Training", "version": "2.1"}', '22222222-2222-2222-2222-222222222222'),
('Safety Guidelines', '/documents/safety.pdf', 'application/pdf', 524288, '{"department": "Safety", "version": "1.2"}', '33333333-3333-3333-3333-333333333333');

-- Quotes
INSERT INTO quotes (client_id, total_amount, status, valid_until, metadata) VALUES
('44444444-4444-4444-4444-444444444444', 1500.00, 'pending', '2025-02-13', '{"created_by": "11111111-1111-1111-1111-111111111111", "service_type": "consulting"}'),
('55555555-5555-5555-5555-555555555555', 2750.00, 'accepted', '2025-02-28', '{"created_by": "22222222-2222-2222-2222-222222222222", "service_type": "training"}'),
('66666666-6666-6666-6666-666666666666', 950.00, 'draft', '2025-02-20', '{"created_by": "33333333-3333-3333-3333-333333333333", "service_type": "assessment"}');

-- Reports
INSERT INTO reports (name, type, schedule, last_run, next_run, parameters) VALUES
('Monthly Timesheet', 'timesheet', '0 0 1 * *', '2025-01-01 00:00:00+08', '2025-02-01 00:00:00+08', '{"format": "pdf", "department": "all"}'),
('Weekly Progress', 'progress', '0 0 * * 0', '2025-01-07 00:00:00+08', '2025-01-14 00:00:00+08', '{"format": "excel", "team": "development"}'),
('Daily Backup', 'backup', '0 0 * * *', '2025-01-12 00:00:00+08', '2025-01-13 00:00:00+08', '{"type": "incremental", "retention": "30days"}');
