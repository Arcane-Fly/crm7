-- Enable pgvector extension for ML features
CREATE EXTENSION IF NOT EXISTS vector;

-- ML Models table
CREATE TABLE ml_models (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    model_type text NOT NULL CHECK (model_type IN ('rate_prediction', 'margin_prediction', 'anomaly_detection')),
    model_version text NOT NULL,
    model_data jsonb NOT NULL,
    hyperparameters jsonb,
    metrics jsonb,
    training_start timestamp with time zone,
    training_end timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ML Feature Store
CREATE TABLE ml_features (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    feature_type text NOT NULL,
    feature_name text NOT NULL,
    feature_value double precision,
    feature_vector vector(1536),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- ML Predictions
CREATE TABLE ml_predictions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    model_id uuid REFERENCES ml_models(id),
    prediction_type text NOT NULL,
    input_data jsonb,
    predicted_value double precision,
    actual_value double precision,
    confidence_score double precision,
    prediction_factors jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Rate Anomalies
CREATE TABLE rate_anomalies (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES organizations(id),
    calculation_id uuid REFERENCES rate_calculations(id),
    anomaly_type text NOT NULL,
    severity double precision,
    expected_value double precision,
    actual_value double precision,
    factors jsonb,
    is_reviewed boolean DEFAULT false,
    review_notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Functions

-- Rate Prediction Function
CREATE OR REPLACE FUNCTION predict_rate(
    p_template_id uuid,
    p_employee_id uuid,
    p_calculation_date timestamp with time zone,
    p_features jsonb
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
    v_model_id uuid;
BEGIN
    -- Get the latest active model
    SELECT id INTO v_model_id
    FROM ml_models
    WHERE model_type = 'rate_prediction'
    AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    -- Make prediction
    INSERT INTO ml_predictions (
        model_id,
        prediction_type,
        input_data,
        predicted_value,
        confidence_score,
        prediction_factors
    )
    VALUES (
        v_model_id,
        'rate',
        jsonb_build_object(
            'template_id', p_template_id,
            'employee_id', p_employee_id,
            'calculation_date', p_calculation_date,
            'features', p_features
        ),
        -- Placeholder for actual ML prediction logic
        100.00,
        0.95,
        '{
            "market_conditions": 0.4,
            "historical_trends": 0.3,
            "employee_experience": 0.2,
            "seasonal_factors": 0.1
        }'::jsonb
    )
    RETURNING jsonb_build_object(
        'predicted_value', predicted_value,
        'confidence_score', confidence_score,
        'factors', prediction_factors
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Anomaly Detection Function
CREATE OR REPLACE FUNCTION detect_rate_anomalies(
    p_org_id uuid,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone,
    p_threshold double precision DEFAULT 0.95
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Detect anomalies
    WITH anomalies AS (
        INSERT INTO rate_anomalies (
            org_id,
            calculation_id,
            anomaly_type,
            severity,
            expected_value,
            actual_value,
            factors
        )
        SELECT
            rc.org_id,
            rc.id,
            'rate_deviation',
            -- Placeholder for actual anomaly detection logic
            random(),
            100.00,
            rc.final_rate,
            '{
                "market_deviation": 0.3,
                "historical_pattern": 0.4,
                "seasonal_impact": 0.3
            }'::jsonb
        FROM rate_calculations rc
        WHERE rc.org_id = p_org_id
        AND rc.calculation_date BETWEEN p_start_date AND p_end_date
        RETURNING *
    )
    SELECT jsonb_build_object(
        'anomalies', jsonb_agg(
            jsonb_build_object(
                'id', id,
                'calculation_id', calculation_id,
                'anomaly_type', anomaly_type,
                'severity', severity,
                'expected_value', expected_value,
                'actual_value', actual_value,
                'factors', factors
            )
        ),
        'metrics', jsonb_build_object(
            'total_analyzed', count(*),
            'anomalies_found', count(*),
            'average_severity', avg(severity)
        )
    )
    FROM anomalies
    INTO v_result;

    RETURN v_result;
END;
$$;

-- Rate Optimization Function
CREATE OR REPLACE FUNCTION optimize_rates(
    p_template_id uuid,
    p_target_margin double precision,
    p_constraints jsonb
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- Placeholder for rate optimization logic
    SELECT jsonb_build_object(
        'optimized_rates', jsonb_build_object(
            'base_rate', 100.00,
            'loading_rate', 25.00,
            'margin_rate', 15.00
        ),
        'expected_margin', p_target_margin,
        'confidence_score', 0.95
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Model Metrics Function
CREATE OR REPLACE FUNCTION get_ml_model_metrics(
    p_model_type text,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'mae', 2.5,
        'mse', 8.75,
        'r2_score', 0.85,
        'feature_importance', jsonb_build_object(
            'market_conditions', 0.4,
            'historical_trends', 0.3,
            'employee_experience', 0.2,
            'seasonal_factors', 0.1
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Indexes
CREATE INDEX idx_ml_models_org_type ON ml_models(org_id, model_type);
CREATE INDEX idx_ml_features_org_type ON ml_features(org_id, feature_type);
CREATE INDEX idx_ml_predictions_org_model ON ml_predictions(org_id, model_id);
CREATE INDEX idx_rate_anomalies_org_calc ON rate_anomalies(org_id, calculation_id);

-- RLS Policies
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY ml_models_org_access ON ml_models
    USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY ml_features_org_access ON ml_features
    USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY ml_predictions_org_access ON ml_predictions
    USING (org_id = auth.jwt() ->> 'org_id'::text);

CREATE POLICY rate_anomalies_org_access ON rate_anomalies
    USING (org_id = auth.jwt() ->> 'org_id'::text);
