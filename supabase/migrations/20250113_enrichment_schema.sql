-- Add enriched_data column to apprentices table
ALTER TABLE apprentices
ADD COLUMN IF NOT EXISTS enriched_data JSONB DEFAULT '{}'::jsonb;

-- Add market_data column to qualifications table
ALTER TABLE qualifications
ADD COLUMN IF NOT EXISTS market_data JSONB DEFAULT '{}'::jsonb;

-- Create enrichment_logs table
CREATE TABLE IF NOT EXISTS enrichment_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id uuid NOT NULL,
  source TEXT,
  enrichment_type TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create function to log enrichment attempts
CREATE OR REPLACE FUNCTION log_enrichment()
RETURNS trigger AS $$
BEGIN
  INSERT INTO enrichment_logs (
    entity_type,
    entity_id,
    enrichment_type,
    status,
    created_by
  ) VALUES (
    TG_TABLE_NAME,
    NEW.id,
    CASE 
      WHEN NEW.enriched_data IS NOT NULL THEN 'AI_ENRICHMENT'
      WHEN NEW.market_data IS NOT NULL THEN 'MARKET_DATA'
    END,
    'SUCCESS',
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for logging
CREATE TRIGGER apprentice_enrichment_log
AFTER UPDATE OF enriched_data ON apprentices
FOR EACH ROW
WHEN (OLD.enriched_data IS DISTINCT FROM NEW.enriched_data)
EXECUTE FUNCTION log_enrichment();

CREATE TRIGGER qualification_enrichment_log
AFTER UPDATE OF market_data ON qualifications
FOR EACH ROW
WHEN (OLD.market_data IS DISTINCT FROM NEW.market_data)
EXECUTE FUNCTION log_enrichment();

-- Create view for enrichment statistics
CREATE OR REPLACE VIEW enrichment_statistics AS
SELECT
  entity_type,
  enrichment_type,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_enrichment
FROM enrichment_logs
GROUP BY entity_type, enrichment_type, status;
