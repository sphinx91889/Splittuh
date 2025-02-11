/*
  # Split Sheet Database Schema

  1. New Tables
    - `split_sheets`
      - Main table for storing split sheet information
      - Links to user who created it
      - Stores song details
    - `collaborators`
      - Stores collaborator information
      - Links to split_sheets
    - `signatures`
      - Stores signature data for each collaborator
      - Links to collaborators

  2. Security
    - Enable RLS on all tables
    - Users can only access their own split sheets
    - Collaborators can view split sheets they're part of
*/

-- Split Sheets Table
CREATE TABLE IF NOT EXISTS split_sheets (
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collaborators Table
CREATE TABLE IF NOT EXISTS collaborators (
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
  created_at timestamptz DEFAULT now()
);

-- Signatures Table
CREATE TABLE IF NOT EXISTS signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid REFERENCES collaborators(id) ON DELETE CASCADE,
  signature_data text NOT NULL,
  signed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Policies
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
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE split_sheets.id = collaborators.split_sheet_id
      AND collaborators.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "View collaborators for accessible split sheets"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = collaborators.split_sheet_id
      AND (split_sheets.user_id = auth.uid()
        OR collaborators.email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Insert collaborators for own split sheets"
  ON collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM split_sheets
      WHERE split_sheets.id = collaborators.split_sheet_id
      AND split_sheets.user_id = auth.uid()
    )
  );

CREATE POLICY "View signatures for accessible split sheets"
  ON signatures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      JOIN split_sheets ON split_sheets.id = collaborators.split_sheet_id
      WHERE collaborators.id = signatures.collaborator_id
      AND (split_sheets.user_id = auth.uid()
        OR collaborators.email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Insert signatures for own collaborator record"
  ON signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.id = signatures.collaborator_id
      AND collaborators.email = auth.jwt() ->> 'email'
    )
  );