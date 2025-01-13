-- Enhance qualifications table with additional fields
ALTER TABLE qualifications ADD COLUMN
    training_package_code TEXT,
    training_package_title TEXT,
    training_package_status TEXT,
    training_package_release TEXT,
    training_package_release_date DATE,
    specialisations BOOLEAN DEFAULT FALSE,
    nrt_status TEXT,
    currency_start_date DATE,
    currency_end_date DATE,
    superseded_by TEXT,
    supersedes TEXT,
    is_equivalent BOOLEAN,
    release_number TEXT,
    release_date DATE,
    anzsco_code TEXT,
    anzsco_title TEXT,
    field_of_education TEXT,
    regulatory_requirements TEXT[],
    entry_requirements TEXT[];

-- Create training packages table
CREATE TABLE training_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    current_release TEXT,
    release_date DATE,
    developer TEXT,
    industry_sector TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create units of competency table
CREATE TABLE units_of_competency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_package_id UUID REFERENCES training_packages(id),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    elements JSONB,  -- Stores performance criteria and elements
    assessment_requirements JSONB,
    nominal_hours INTEGER,
    status TEXT,
    currency_start_date DATE,
    currency_end_date DATE,
    superseded_by TEXT,
    supersedes TEXT,
    is_equivalent BOOLEAN,
    release_number TEXT,
    release_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qualification structure table
CREATE TABLE qualification_structure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qualification_id UUID REFERENCES qualifications(id),
    unit_type TEXT NOT NULL CHECK (unit_type IN ('Core', 'Elective', 'Specialisation')),
    unit_id UUID REFERENCES units_of_competency(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(qualification_id, unit_id)
);

-- Create apprentice competencies table
CREATE TABLE apprentice_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    unit_id UUID REFERENCES units_of_competency(id),
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'RPL', 'Credit Transfer')),
    assessor_id UUID REFERENCES auth.users,
    assessment_date DATE,
    evidence_provided TEXT[],
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(apprentice_id, unit_id)
);

-- Create RTO scope table
CREATE TABLE rto_scope (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rto_id UUID REFERENCES rtos(id),
    qualification_id UUID REFERENCES qualifications(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rto_id, qualification_id)
);

-- Create training delivery modes table
CREATE TABLE training_delivery_modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create training delivery plans table
CREATE TABLE training_delivery_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_qualification_id UUID REFERENCES apprentice_qualifications(id),
    delivery_mode_id UUID REFERENCES training_delivery_modes(id),
    unit_id UUID REFERENCES units_of_competency(id),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    trainer_id UUID REFERENCES auth.users,
    location TEXT,
    resources_required TEXT[],
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create useful views

-- Apprentice Qualification Progress
CREATE VIEW apprentice_qualification_progress AS
SELECT 
    a.id AS apprentice_id,
    a.first_name || ' ' || a.last_name AS apprentice_name,
    q.code AS qualification_code,
    q.name AS qualification_name,
    q.level AS qualification_level,
    qs.unit_type,
    uc.code AS unit_code,
    uc.title AS unit_title,
    ac.status AS competency_status,
    ac.assessment_date,
    u.email AS assessor_email
FROM 
    apprentices a
    JOIN apprentice_qualifications aq ON a.id = aq.apprentice_id
    JOIN qualifications q ON aq.qualification_id = q.id
    JOIN qualification_structure qs ON q.id = qs.qualification_id
    JOIN units_of_competency uc ON qs.unit_id = uc.id
    LEFT JOIN apprentice_competencies ac ON a.id = ac.apprentice_id AND uc.id = ac.unit_id
    LEFT JOIN auth.users u ON ac.assessor_id = u.id;

-- Training Package Structure
CREATE VIEW training_package_structure AS
SELECT 
    tp.code AS training_package_code,
    tp.title AS training_package_title,
    q.code AS qualification_code,
    q.name AS qualification_name,
    q.level AS level,
    qs.unit_type,
    uc.code AS unit_code,
    uc.title AS unit_title,
    uc.nominal_hours
FROM 
    training_packages tp
    JOIN qualifications q ON tp.code = q.training_package_code
    JOIN qualification_structure qs ON q.id = qs.qualification_id
    JOIN units_of_competency uc ON qs.unit_id = uc.id;

-- RTO Qualification Scope
CREATE VIEW rto_qualification_scope AS
SELECT 
    r.name AS rto_name,
    r.rto_number,
    q.code AS qualification_code,
    q.name AS qualification_name,
    rs.start_date AS scope_start_date,
    rs.end_date AS scope_end_date,
    CASE 
        WHEN rs.end_date IS NULL OR rs.end_date > CURRENT_DATE THEN 'Active'
        ELSE 'Expired'
    END AS scope_status
FROM 
    rtos r
    JOIN rto_scope rs ON r.id = rs.rto_id
    JOIN qualifications q ON rs.qualification_id = q.id;

-- Add indexes for performance
CREATE INDEX idx_units_code ON units_of_competency(code);
CREATE INDEX idx_qualification_code ON qualifications(code);
CREATE INDEX idx_apprentice_competencies_composite 
    ON apprentice_competencies(apprentice_id, unit_id, status);
CREATE INDEX idx_qualification_structure_composite 
    ON qualification_structure(qualification_id, unit_id, unit_type);
CREATE INDEX idx_rto_scope_dates 
    ON rto_scope(rto_id, qualification_id, start_date, end_date);
