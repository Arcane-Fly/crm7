-- Create enum types
CREATE TYPE qualification_level AS ENUM (
  'Certificate_I',
  'Certificate_II',
  'Certificate_III',
  'Certificate_IV',
  'Diploma',
  'Advanced_Diploma'
);

CREATE TYPE employment_status AS ENUM (
  'Full_Time',
  'Part_Time',
  'School_Based',
  'Casual'
);

CREATE TYPE apprenticeship_status AS ENUM (
  'Pre_Commencement',
  'Active',
  'Suspended',
  'Cancelled',
  'Completed'
);

-- Create apprentices table
CREATE TABLE apprentices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  employment_status employment_status NOT NULL,
  apprenticeship_status apprenticeship_status NOT NULL,
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qualifications table
CREATE TABLE qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  level qualification_level NOT NULL,
  description TEXT,
  nominal_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create apprentice_qualifications table
CREATE TABLE apprentice_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apprentice_id UUID REFERENCES apprentices(id),
  qualification_id UUID REFERENCES qualifications(id),
  start_date DATE NOT NULL,
  expected_completion_date DATE,
  actual_completion_date DATE,
  status apprenticeship_status NOT NULL,
  rto_id UUID,  -- Reference to training provider
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create host_employers table
CREATE TABLE host_employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  abn TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postcode TEXT,
  industry_sector TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create placements table
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apprentice_id UUID REFERENCES apprentices(id),
  host_employer_id UUID REFERENCES host_employers(id),
  start_date DATE NOT NULL,
  end_date DATE,
  award_code TEXT NOT NULL,
  pay_level TEXT NOT NULL,
  hours_per_week NUMERIC(5,2),
  supervisor_name TEXT,
  supervisor_phone TEXT,
  supervisor_email TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training_plans table
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apprentice_qualification_id UUID REFERENCES apprentice_qualifications(id),
  units_required INTEGER NOT NULL,
  units_completed INTEGER DEFAULT 0,
  next_review_date DATE,
  last_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training_units table
CREATE TABLE training_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_plan_id UUID REFERENCES training_plans(id),
  unit_code TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  nominal_hours INTEGER,
  status TEXT NOT NULL,
  start_date DATE,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_reviews table
CREATE TABLE progress_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apprentice_id UUID REFERENCES apprentices(id),
  reviewer_id UUID REFERENCES auth.users,
  review_date DATE NOT NULL,
  attendance_rating INTEGER,
  performance_rating INTEGER,
  safety_rating INTEGER,
  comments TEXT,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_apprentices_status ON apprentices(apprenticeship_status);
CREATE INDEX idx_apprentice_qualifications_status ON apprentice_qualifications(status);
CREATE INDEX idx_placements_dates ON placements(start_date, end_date);
CREATE INDEX idx_training_plans_review ON training_plans(next_review_date);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apprentices_updated_at
    BEFORE UPDATE ON apprentices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qualifications_updated_at
    BEFORE UPDATE ON qualifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apprentice_qualifications_updated_at
    BEFORE UPDATE ON apprentice_qualifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_employers_updated_at
    BEFORE UPDATE ON host_employers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placements_updated_at
    BEFORE UPDATE ON placements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
    BEFORE UPDATE ON training_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_units_updated_at
    BEFORE UPDATE ON training_units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_reviews_updated_at
    BEFORE UPDATE ON progress_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
