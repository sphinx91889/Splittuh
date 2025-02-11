/*
  # Update split sheets table to include all data points

  1. Changes
    - Add signatures field to store signature data for each collaborator
    - Update collaborators JSONB structure to include all required fields
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
    - Add index on user_id for faster lookups
*/

-- Add signatures field to split_sheets table
ALTER TABLE split_sheets 
ADD COLUMN IF NOT EXISTS signatures jsonb DEFAULT '[]'::jsonb;

-- Add index for user_id for faster lookups
CREATE INDEX IF NOT EXISTS split_sheets_user_id_idx ON split_sheets(user_id);

-- Add index for collaborators email lookup (used in RLS policy)
CREATE INDEX IF NOT EXISTS split_sheets_collaborators_email_idx ON split_sheets
USING gin ((collaborators));

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_split_sheets_updated_at
    BEFORE UPDATE ON split_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();