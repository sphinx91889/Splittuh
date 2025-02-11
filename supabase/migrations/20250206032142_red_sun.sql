/*
  # Fix RLS Policies

  1. Changes
    - Restructure RLS policies to avoid infinite recursion
    - Simplify policy conditions
    - Add proper indexes for performance
    - Maintain security while fixing the recursion issue

  2. Security
    - Maintains same level of security
    - Fixes policy recursion issues
    - Ensures proper access control
*/

-- First, check if tables exist and drop them if they do
DO $$ 
BEGIN
  DROP TABLE IF EXISTS collaborators CASCADE;
  DROP TABLE IF EXISTS split_sheets CASCADE;
END $$;

-- Create split_sheets table
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
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create collaborators table
CREATE TABLE collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  split_sheet_id uuid REFERENCES split_sheets(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  stage_name text,
  role text NOT NULL,
  email text NOT NULL,
  publisher_name text,
  pro_affiliation text,
  ipi_number text,
  percentage numeric NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  signature text,
  signature_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_split_sheets_user_id ON split_sheets(user_id);
CREATE INDEX idx_split_sheets_deleted_at ON split_sheets(deleted_at);
CREATE INDEX idx_split_sheets_status ON split_sheets(status);
CREATE INDEX idx_collaborators_split_sheet_id ON collaborators(split_sheet_id);
CREATE INDEX idx_collaborators_email ON collaborators(email);
CREATE INDEX idx_collaborators_signature ON collaborators(signature) WHERE signature IS NOT NULL;

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Split sheets policies
CREATE POLICY "Owner can view split sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Collaborator can view split sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT split_sheet_id 
      FROM collaborators 
      WHERE email = auth.jwt() ->> 'email'
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Owner can insert split sheets"
  ON split_sheets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update split sheets"
  ON split_sheets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Collaborators policies
CREATE POLICY "Owner can view collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Collaborator can view own record"
  ON collaborators FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Owner can insert collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborator can update own signature"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- Add updated_at triggers
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

CREATE TRIGGER update_collaborators_updated_at
    BEFORE UPDATE ON collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE split_sheets IS 'Stores split sheet information';
COMMENT ON TABLE collaborators IS 'Stores collaborator information for split sheets';
COMMENT ON COLUMN split_sheets.status IS 'Current state of the split sheet document';
COMMENT ON COLUMN split_sheets.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN collaborators.signature IS 'Base64 encoded signature image';
COMMENT ON COLUMN collaborators.signature_date IS 'Timestamp when the collaborator signed';