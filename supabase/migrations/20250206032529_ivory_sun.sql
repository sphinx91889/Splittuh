-- Drop existing signature index
DROP INDEX IF EXISTS idx_collaborators_signature;

-- Modify signature column to use TEXT without an index
ALTER TABLE collaborators
ALTER COLUMN signature TYPE TEXT;

-- Create a new index on signature_date instead
CREATE INDEX idx_collaborators_signature_date 
ON collaborators(signature_date) 
WHERE signature_date IS NOT NULL;

-- Add comment explaining signature storage
COMMENT ON COLUMN collaborators.signature IS 'Base64 encoded signature image - not indexed due to size';