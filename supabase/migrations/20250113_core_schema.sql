-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations
CREATE TABLE organizations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  abn TEXT,
  acn TEXT,
  address JSONB,
  contact_info JSONB,
  industry_type TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles and Permissions
CREATE TABLE roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  organization_id uuid REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles (extends auth.users)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  organization_id uuid REFERENCES organizations(id),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  active_status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles (many-to-many)
CREATE TABLE user_roles (
  user_id uuid REFERENCES user_profiles(id),
  role_id uuid REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Employees/Candidates
CREATE TABLE employees (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  dob DATE,
  employment_type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Host Employers
CREATE TABLE host_employers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name TEXT NOT NULL,
  abn TEXT,
  address JSONB,
  contact_info JSONB,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs/Placements
CREATE TABLE jobs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  host_employer_id uuid REFERENCES host_employers(id),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB,
  start_date DATE,
  end_date DATE,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employee Job Assignments (many-to-many)
CREATE TABLE job_assignments (
  employee_id uuid REFERENCES employees(id),
  job_id uuid REFERENCES jobs(id),
  start_date DATE,
  end_date DATE,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (employee_id, job_id)
);

-- Rosters/Shifts
CREATE TABLE rosters (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id),
  employee_id uuid REFERENCES employees(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER, -- in minutes
  location JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Timesheets
CREATE TABLE timesheets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  job_id uuid REFERENCES jobs(id),
  roster_id uuid REFERENCES rosters(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER,
  total_hours DECIMAL(10,2),
  status TEXT,
  pay_rate DECIMAL(10,2),
  charge_rate DECIMAL(10,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Licences/Certifications
CREATE TABLE licences (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  type TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT,
  document_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Qualifications/AQF
CREATE TABLE qualifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  name TEXT NOT NULL,
  aqf_level INTEGER,
  completion_date DATE,
  rto_name TEXT,
  rto_code TEXT,
  document_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Courses/Modules
CREATE TABLE training_courses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  trainer TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Enrollments (many-to-many)
CREATE TABLE training_enrollments (
  employee_id uuid REFERENCES employees(id),
  course_id uuid REFERENCES training_courses(id),
  enrollment_date DATE,
  completion_date DATE,
  status TEXT,
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (employee_id, course_id)
);

-- Pay Rates
CREATE TABLE pay_rates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id uuid REFERENCES employees(id),
  base_rate DECIMAL(10,2) NOT NULL,
  penalty_rates JSONB DEFAULT '{}'::jsonb,
  effective_date DATE NOT NULL,
  end_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices/Billing
CREATE TABLE invoices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  reference_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10,2),
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Timesheet Invoice Items
CREATE TABLE invoice_items (
  invoice_id uuid REFERENCES invoices(id),
  timesheet_id uuid REFERENCES timesheets(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (invoice_id, timesheet_id)
);

-- Funding/Incentive Claims
CREATE TABLE funding_claims (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  program_name TEXT NOT NULL,
  employee_id uuid REFERENCES employees(id),
  host_employer_id uuid REFERENCES host_employers(id),
  amount DECIMAL(10,2),
  status TEXT,
  submitted_date DATE,
  approved_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Integration Settings
CREATE TABLE integration_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  integration_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES user_profiles(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents/Attachments
CREATE TABLE documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  linked_object_type TEXT NOT NULL,
  linked_object_id uuid NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by uuid REFERENCES user_profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log
CREATE TABLE audit_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES user_profiles(id),
  action_type TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id uuid NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System Settings
CREATE TABLE system_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_employees_organization ON employees(organization_id);
CREATE INDEX idx_jobs_organization ON jobs(organization_id);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_documents_linked_object ON documents(linked_object_type, linked_object_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_name,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to main tables
CREATE TRIGGER employees_audit
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER jobs_audit
AFTER INSERT OR UPDATE OR DELETE ON jobs
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER timesheets_audit
AFTER INSERT OR UPDATE OR DELETE ON timesheets
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
