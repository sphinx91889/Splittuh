/*
  # Restructure Split Sheets Schema with Proper Relations

  1. New Tables
    - `split_sheets`: Core table for song and split sheet details
    - `collaborators`: Table for collaborator details with foreign key to split_sheets

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing split sheets and collaborators

  3. Changes
    - Migrate data in correct order
    - Preserve all relationships
*/

-- Create new tables with proper relations
CREATE TABLE new_split_sheets (
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
  version integer DEFAULT 1,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  split_sheet_id uuid REFERENCES new_split_sheets(id) ON DELETE CASCADE,
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

-- Create indexes
CREATE INDEX idx_split_sheets_user_id ON new_split_sheets(user_id);
CREATE INDEX idx_split_sheets_deleted_at ON new_split_sheets(deleted_at);
CREATE INDEX idx_split_sheets_status ON new_split_sheets(status);
CREATE INDEX idx_collaborators_split_sheet_id ON collaborators(split_sheet_id);
CREATE INDEX idx_collaborators_email ON collaborators(email);

-- Enable RLS
ALTER TABLE new_split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for split_sheets
CREATE POLICY "Users can view their own split sheets"
  ON new_split_sheets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert their own split sheets"
  ON new_split_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own split sheets"
  ON new_split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for collaborators
CREATE POLICY "Users can view collaborators for their split sheets"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM new_split_sheets
      WHERE new_split_sheets.id = collaborators.split_sheet_id
      AND (
        new_split_sheets.user_id = auth.uid()
        OR collaborators.email = auth.jwt() ->> 'email'
      )
      AND new_split_sheets.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert collaborators for their split sheets"
  ON collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM new_split_sheets
      WHERE new_split_sheets.id = collaborators.split_sheet_id
      AND new_split_sheets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own collaborator records"
  ON collaborators
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM new_split_sheets
      WHERE new_split_sheets.id = collaborators.split_sheet_id
      AND new_split_sheets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM new_split_sheets
      WHERE new_split_sheets.id = collaborators.split_sheet_id
      AND new_split_sheets.user_id = auth.uid()
    )
  );

-- Migrate data using a DO block for better control
DO $$
DECLARE
  sheet_record RECORD;
  new_sheet_id uuid;
BEGIN
  -- Iterate through distinct split sheets
  FOR sheet_record IN (
    SELECT DISTINCT ON (title, created_at)
      id,
      user_id,
      title,
      release_date,
      artist_name,
      produced_by,
      isrc_code,
      duration,
      rights_type,
      separate_publishing_splits,
      status,
      version,
      metadata,
      created_at,
      updated_at,
      deleted_at
    FROM split_sheets
  ) LOOP
    -- Insert into new_split_sheets and get the new ID
    INSERT INTO new_split_sheets (
      id,
      user_id,
      title,
      release_date,
      artist_name,
      produced_by,
      isrc_code,
      duration,
      rights_type,
      separate_publishing_splits,
      status,
      version,
      metadata,
      created_at,
      updated_at,
      deleted_at
    ) VALUES (
      sheet_record.id,
      sheet_record.user_id,
      sheet_record.title,
      sheet_record.release_date,
      sheet_record.artist_name,
      sheet_record.produced_by,
      sheet_record.isrc_code,
      sheet_record.duration,
      sheet_record.rights_type,
      sheet_record.separate_publishing_splits,
      sheet_record.status,
      sheet_record.version,
      sheet_record.metadata,
      sheet_record.created_at,
      sheet_record.updated_at,
      sheet_record.deleted_at
    ) RETURNING id INTO new_sheet_id;

    -- Insert collaborators for this split sheet
    INSERT INTO collaborators (
      split_sheet_id,
      legal_name,
      stage_name,
      role,
      email,
      publisher_name,
      pro_affiliation,
      ipi_number,
      percentage,
      signature,
      signature_date,
      created_at,
      updated_at
    )
    SELECT
      new_sheet_id,
      legal_name,
      stage_name,
      role,
      email,
      publisher_name,
      pro_affiliation,
      ipi_number,
      percentage,
      signature,
      signature_date,
      created_at,
      updated_at
    FROM split_sheets
    WHERE title = sheet_record.title
    AND created_at = sheet_record.created_at;
  END LOOP;
END $$;

-- Drop old table and rename new one
DROP TABLE split_sheets CASCADE;
ALTER TABLE new_split_sheets RENAME TO split_sheets;

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