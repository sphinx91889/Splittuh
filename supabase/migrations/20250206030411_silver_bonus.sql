/*
  # Fresh Database Schema

  1. New Tables
    - split_sheets: Core table for song split sheet information
    - collaborators: Table for collaborator details with proper relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure data integrity with constraints

  3. Performance
    - Add appropriate indexes
    - Optimize query patterns
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
  percentage numeric NOT NULL,
  signature text,
  signature_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create basic indexes first
CREATE INDEX idx_split_sheets_user_id ON split_sheets(user_id);
CREATE INDEX idx_split_sheets_deleted_at ON split_sheets(deleted_at);
CREATE INDEX idx_collaborators_split_sheet_id ON collaborators(split_sheet_id);
CREATE INDEX idx_collaborators_email ON collaborators(email);

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own split sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own split sheets"
  ON split_sheets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own split sheets"
  ON split_sheets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
      AND split_sheets.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update collaborator signatures"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  );

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_split_sheets_updated_at
    BEFORE UPDATE ON split_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborators_updated_at
    BEFORE UPDATE ON collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();