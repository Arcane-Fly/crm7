-- Additional Enums
CREATE TYPE contact_preference AS ENUM ('Email', 'Phone', 'SMS');
CREATE TYPE education_level AS ENUM ('Year_10', 'Year_11', 'Year_12', 'Other');
CREATE TYPE disability_status AS ENUM ('None', 'Physical', 'Hearing', 'Vision', 'Learning', 'Other');
CREATE TYPE indigenous_status AS ENUM ('None', 'Aboriginal', 'Torres_Strait_Islander', 'Both');
CREATE TYPE funding_type AS ENUM ('State', 'Federal', 'User_Choice', 'Fee_For_Service');
CREATE TYPE incident_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE compliance_status AS ENUM ('Compliant', 'Minor_Issues', 'Major_Issues', 'Non_Compliant');

-- Enhance existing tables with more fields
ALTER TABLE apprentices ADD COLUMN
    preferred_contact contact_preference,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    education_level education_level,
    prior_qualifications TEXT[],
    disability_status disability_status,
    disability_details TEXT,
    indigenous_status indigenous_status,
    language_spoken_at_home TEXT,
    needs_interpreter BOOLEAN DEFAULT FALSE,
    usie_number TEXT UNIQUE,  -- Unique Student Identifier
    tax_file_number TEXT,
    medicare_number TEXT,
    bank_account_name TEXT,
    bank_bsb TEXT,
    bank_account_number TEXT,
    superannuation_fund TEXT,
    superannuation_number TEXT,
    visa_status TEXT,
    visa_expiry DATE,
    work_rights_status TEXT,
    drivers_license_number TEXT,
    drivers_license_expiry DATE,
    drivers_license_state TEXT,
    working_with_children_check TEXT,
    wwcc_expiry DATE,
    police_check_reference TEXT,
    police_check_expiry DATE;

-- Add constraints
ALTER TABLE apprentices 
    ADD CONSTRAINT valid_tfn CHECK (tax_file_number ~ '^[0-9]{9}$'),
    ADD CONSTRAINT valid_medicare CHECK (medicare_number ~ '^[0-9]{10}$'),
    ADD CONSTRAINT valid_bsb CHECK (bank_bsb ~ '^[0-9]{6}$');

-- New Tables

-- School Details
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postcode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School-based apprentice details
CREATE TABLE school_based_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    school_id UUID REFERENCES schools(id),
    year_level TEXT NOT NULL,
    school_coordinator_name TEXT,
    school_coordinator_email TEXT,
    school_coordinator_phone TEXT,
    school_days TEXT[],
    work_days TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RTOs (Registered Training Organizations)
CREATE TABLE rtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rto_number TEXT UNIQUE NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postcode TEXT,
    compliance_rating compliance_status,
    last_audit_date DATE,
    next_audit_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funding Details
CREATE TABLE funding_arrangements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_qualification_id UUID REFERENCES apprentice_qualifications(id),
    funding_type funding_type NOT NULL,
    funding_source TEXT,
    contract_id TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    total_funded_amount DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safety Incidents
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    placement_id UUID REFERENCES placements(id),
    incident_date TIMESTAMPTZ NOT NULL,
    incident_location TEXT,
    incident_description TEXT NOT NULL,
    severity incident_severity NOT NULL,
    immediate_action_taken TEXT,
    reported_to_regulator BOOLEAN DEFAULT FALSE,
    regulator_reference TEXT,
    investigation_required BOOLEAN DEFAULT FALSE,
    investigation_findings TEXT,
    corrective_actions TEXT,
    witness_names TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Services
CREATE TABLE support_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    service_type TEXT NOT NULL,
    provider_name TEXT,
    contact_person TEXT,
    contact_details TEXT,
    start_date DATE,
    end_date DATE,
    referral_reason TEXT,
    outcomes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment and Resources
CREATE TABLE equipment_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    item_type TEXT NOT NULL,
    item_description TEXT,
    serial_number TEXT,
    issue_date DATE,
    return_date DATE,
    condition_on_issue TEXT,
    condition_on_return TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentoring Sessions
CREATE TABLE mentoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    mentor_id UUID REFERENCES auth.users,
    session_date TIMESTAMPTZ NOT NULL,
    session_type TEXT,
    duration_minutes INTEGER,
    topics_discussed TEXT[],
    outcomes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Checks
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apprentice_id UUID REFERENCES apprentices(id),
    check_type TEXT NOT NULL,
    check_date DATE NOT NULL,
    status compliance_status NOT NULL,
    checked_by UUID REFERENCES auth.users,
    findings TEXT,
    action_required TEXT,
    due_date DATE,
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create useful views

-- Active Apprentices Overview
CREATE VIEW active_apprentices_overview AS
SELECT 
    a.id,
    a.first_name || ' ' || a.last_name AS full_name,
    a.usie_number,
    a.employment_status,
    a.apprenticeship_status,
    aq.qualification_id,
    q.name AS qualification_name,
    q.level AS qualification_level,
    p.host_employer_id,
    he.business_name AS host_employer_name,
    p.start_date AS placement_start,
    p.end_date AS placement_end,
    tp.units_completed,
    tp.units_required,
    ROUND((tp.units_completed::FLOAT / tp.units_required::FLOAT) * 100, 2) AS completion_percentage
FROM 
    apprentices a
    LEFT JOIN apprentice_qualifications aq ON a.id = aq.apprentice_id
    LEFT JOIN qualifications q ON aq.qualification_id = q.id
    LEFT JOIN placements p ON a.id = p.apprentice_id
    LEFT JOIN host_employers he ON p.host_employer_id = he.id
    LEFT JOIN training_plans tp ON aq.id = tp.apprentice_qualification_id
WHERE 
    a.apprenticeship_status = 'Active'
    AND (p.end_date IS NULL OR p.end_date > CURRENT_DATE);

-- Compliance Dashboard
CREATE VIEW compliance_dashboard AS
SELECT 
    a.id AS apprentice_id,
    a.first_name || ' ' || a.last_name AS apprentice_name,
    a.working_with_children_check,
    a.wwcc_expiry,
    a.police_check_reference,
    a.police_check_expiry,
    cc.status AS latest_compliance_status,
    cc.check_date AS latest_compliance_check,
    pr.review_date AS latest_progress_review,
    pr.next_review_date AS next_progress_review,
    CASE 
        WHEN a.wwcc_expiry < CURRENT_DATE THEN 'Expired'
        WHEN a.wwcc_expiry < CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Valid'
    END AS wwcc_status,
    CASE 
        WHEN a.police_check_expiry < CURRENT_DATE THEN 'Expired'
        WHEN a.police_check_expiry < CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Valid'
    END AS police_check_status
FROM 
    apprentices a
    LEFT JOIN LATERAL (
        SELECT status, check_date
        FROM compliance_checks
        WHERE apprentice_id = a.id
        ORDER BY check_date DESC
        LIMIT 1
    ) cc ON true
    LEFT JOIN LATERAL (
        SELECT review_date, next_review_date
        FROM progress_reviews
        WHERE apprentice_id = a.id
        ORDER BY review_date DESC
        LIMIT 1
    ) pr ON true;

-- Training Progress
CREATE VIEW training_progress AS
SELECT 
    a.id AS apprentice_id,
    a.first_name || ' ' || a.last_name AS apprentice_name,
    q.name AS qualification_name,
    q.level AS qualification_level,
    tp.units_completed,
    tp.units_required,
    ROUND((tp.units_completed::FLOAT / tp.units_required::FLOAT) * 100, 2) AS completion_percentage,
    COUNT(DISTINCT tu.id) AS total_units,
    SUM(CASE WHEN tu.status = 'Completed' THEN 1 ELSE 0 END) AS completed_units,
    SUM(CASE WHEN tu.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_units,
    SUM(CASE WHEN tu.status = 'Not Started' THEN 1 ELSE 0 END) AS not_started_units,
    MAX(pr.review_date) AS last_review_date,
    MAX(pr.next_review_date) AS next_review_date
FROM 
    apprentices a
    JOIN apprentice_qualifications aq ON a.id = aq.apprentice_id
    JOIN qualifications q ON aq.qualification_id = q.id
    JOIN training_plans tp ON aq.id = tp.apprentice_qualification_id
    LEFT JOIN training_units tu ON tp.id = tu.training_plan_id
    LEFT JOIN progress_reviews pr ON a.id = pr.apprentice_id
GROUP BY 
    a.id, a.first_name, a.last_name, q.name, q.level, tp.units_completed, tp.units_required;

-- Add indexes for performance
CREATE INDEX idx_apprentices_status_composite ON apprentices(apprenticeship_status, employment_status);
CREATE INDEX idx_placements_dates_composite ON placements(apprentice_id, start_date, end_date);
CREATE INDEX idx_training_progress ON training_units(training_plan_id, status);
CREATE INDEX idx_compliance_checks_composite ON compliance_checks(apprentice_id, check_date, status);
CREATE INDEX idx_progress_reviews_dates ON progress_reviews(apprentice_id, review_date, next_review_date);

-- Add triggers for compliance alerts
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.wwcc_expiry < CURRENT_DATE + INTERVAL '30 days' OR
       NEW.police_check_expiry < CURRENT_DATE + INTERVAL '30 days' THEN
        INSERT INTO compliance_checks (
            apprentice_id,
            check_type,
            check_date,
            status,
            findings,
            action_required,
            due_date
        ) VALUES (
            NEW.id,
            'Document Expiry',
            CURRENT_DATE,
            'Minor_Issues',
            'Document(s) expiring soon',
            'Renew expiring documents',
            LEAST(NEW.wwcc_expiry, NEW.police_check_expiry)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_apprentice_documents
    AFTER INSERT OR UPDATE ON apprentices
    FOR EACH ROW
    EXECUTE FUNCTION check_document_expiry();
