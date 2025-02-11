/*
  # Update split sheets table for single-table storage

  1. Changes
    - Drop existing split_sheets table if it exists
    - Create new split_sheets table with JSONB collaborators column
    - Set up RLS policies
*/

-- Drop existing table and its policies
DROP TABLE IF EXISTS split_sheets CASCADE;

-- Create new table
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
  collaborators jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own split sheets" ON split_sheets;
  DROP POLICY IF EXISTS "Users can insert their own split sheets" ON split_sheets;
  DROP POLICY IF EXISTS "Collaborators can view split sheets they're part of" ON split_sheets;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

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
  USING (
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(collaborators) AS c
      WHERE c->>'email' = auth.jwt() ->> 'email'
    )
  );