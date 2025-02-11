/*
  # Fix RLS Policies - Version 2

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Remove nested EXISTS clauses
    - Use direct table references
    - Separate owner and collaborator policies clearly

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

-- Simple split sheets policies
CREATE POLICY "split_sheets_owner_select"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "split_sheets_owner_insert"
  ON split_sheets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "split_sheets_owner_update"
  ON split_sheets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Simple collaborators policies
CREATE POLICY "collaborators_owner_select"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id FROM split_sheets 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "collaborators_self_select"
  ON collaborators FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "collaborators_owner_insert"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    split_sheet_id IN (
      SELECT id FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_owner_update"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "collaborators_self_update"
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