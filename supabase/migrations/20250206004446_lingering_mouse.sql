/*
  # Add soft delete functionality

  1. Changes
    - Add deleted_at column to split_sheets table
    - Add index on deleted_at for faster queries
    - Update RLS policies to exclude deleted records
*/

-- Add deleted_at column
ALTER TABLE split_sheets
ADD COLUMN deleted_at timestamptz DEFAULT NULL;

-- Add index for deleted_at
CREATE INDEX split_sheets_deleted_at_idx ON split_sheets(deleted_at);

-- Update RLS policies to exclude deleted records
DROP POLICY IF EXISTS "Users can view their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Users can insert their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Collaborators can view split sheets they're part of" ON split_sheets;

CREATE POLICY "Users can view their own split sheets"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own split sheets"
  ON split_sheets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Collaborators can view split sheets they're part of"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email' AND deleted_at IS NULL);

-- Add policy for soft delete
CREATE POLICY "Users can update their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);