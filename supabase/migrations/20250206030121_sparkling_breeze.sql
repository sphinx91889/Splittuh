/*
  # Fresh Start: Clean Database Schema

  1. New Tables
    - split_sheets: Core table for song split sheet information
    - collaborators: Table for collaborator details with proper relationships

  2. Changes
    - Drop all existing tables and start fresh
    - Create new tables with proper relationships and constraints
    - Set up indexes for performance
    - Configure RLS policies for security

  3. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure data integrity with constraints
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS collaborators CASCADE;
DROP TABLE IF EXISTS split_sheets CASCADE;

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
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'completed', 'archived')),
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

-- Create indexes for performance
CREATE INDEX idx_split_sheets_user_id ON split_sheets(user_id);
CREATE INDEX idx_split_sheets_deleted_at ON split_sheets(deleted_at);
CREATE INDEX idx_split_sheets_status ON split_sheets(status);
CREATE INDEX idx_collaborators_split_sheet_id ON collaborators(split_sheet_id);
CREATE INDEX idx_collaborators_email ON collaborators(email);
CREATE INDEX idx_collaborators_signature ON collaborators(signature) WHERE signature IS NOT NULL;

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for split_sheets
CREATE POLICY "Users can view their own split sheets"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id AND deleted_at IS NULL) OR
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.split_sheet_id = id
      AND collaborators.email = auth.jwt() ->> 'email'
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert their own split sheets"
  ON split_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for collaborators
CREATE POLICY "Users can view collaborators"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND (
        split_sheets.user_id = auth.uid()
        OR collaborators.email = auth.jwt() ->> 'email'
      )
      AND split_sheets.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert collaborators"
  ON collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update collaborator signatures"
  ON collaborators
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  );

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

-- Add constraint to ensure collaborator percentages sum to 100 per split sheet
CREATE OR REPLACE FUNCTION check_collaborator_percentages()
RETURNS TRIGGER AS $$
DECLARE
  total_percentage NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentage), 0)
  INTO total_percentage
  FROM collaborators
  WHERE split_sheet_id = NEW.split_sheet_id
  AND id != COALESCE(NEW.id, -1);

  total_percentage := total_percentage + NEW.percentage;

  IF total_percentage > 100 THEN
    RAISE EXCEPTION 'Total percentage cannot exceed 100%%';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_collaborator_percentages
  BEFORE INSERT OR UPDATE ON collaborators
  FOR EACH ROW
  EXECUTE FUNCTION check_collaborator_percentages();

-- Add comments
COMMENT ON TABLE split_sheets IS 'Stores split sheet information';
COMMENT ON TABLE collaborators IS 'Stores collaborator information for split sheets';
COMMENT ON COLUMN split_sheets.status IS 'Current state of the split sheet document';
COMMENT ON COLUMN split_sheets.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN collaborators.signature IS 'Base64 encoded signature image';
COMMENT ON COLUMN collaborators.signature_date IS 'Timestamp when the collaborator signed';