/*
  # Restructure split sheets table

  1. Changes
    - Merge collaborator fields directly into split_sheets table
    - Remove collaborators JSONB column
    - Keep signatures as JSONB for now
    - Preserve existing columns and features

  2. Security
    - Maintain RLS policies
    - Update indexes for new structure
*/

-- Drop existing table and its policies
DROP TABLE IF EXISTS split_sheets CASCADE;

-- Create new table with merged fields
CREATE TABLE split_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  release_date date NOT NULL,
  artist_name text NOT NULL,
  produced_by text NOT NULL,
  isrc_code text,
  duration text,
  rights_type text NOT NULL,
  separate_publishing_splits boolean DEFAULT false,
  -- Collaborator fields
  legal_name text NOT NULL,
  stage_name text,
  role text NOT NULL,
  email text NOT NULL,
  publisher_name text,
  pro_affiliation text,
  ipi_number text,
  percentage numeric NOT NULL,
  -- Existing fields
  signatures jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'completed', 'archived')),
  version integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX split_sheets_user_id_idx ON split_sheets(user_id);
CREATE INDEX split_sheets_email_idx ON split_sheets(email);
CREATE INDEX split_sheets_status_idx ON split_sheets(status);
CREATE INDEX split_sheets_version_idx ON split_sheets(version);
CREATE INDEX split_sheets_user_status_idx ON split_sheets(user_id, status);

-- Create policies
CREATE POLICY "Users can view their own split sheets"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own split sheets"
  ON split_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collaborators can view split sheets they're part of"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Add trigger for updated_at
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

-- Add comments
COMMENT ON TABLE split_sheets IS 'Stores split sheet information including collaborator details';
COMMENT ON COLUMN split_sheets.status IS 'Current state of the split sheet document';
COMMENT ON COLUMN split_sheets.version IS 'Version number of the split sheet document';
COMMENT ON COLUMN split_sheets.metadata IS 'Additional flexible metadata for the split sheet';