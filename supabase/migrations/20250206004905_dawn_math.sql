/*
  # Fix soft delete policy for split sheets

  1. Changes
    - Drop existing policies
    - Create new policies with proper soft delete handling
    - Add indexes for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Users can insert their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Collaborators can view split sheets they're part of" ON split_sheets;
DROP POLICY IF EXISTS "Users can update their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Users can soft delete their own split sheets" ON split_sheets;

-- Create new policies with proper soft delete handling
CREATE POLICY "Users can view their own split sheets"
  ON split_sheets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND deleted_at IS NULL
  );

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
    email = auth.jwt() ->> 'email' 
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can update their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND deleted_at IS NULL
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON POLICY "Users can view their own split sheets" ON split_sheets
  IS 'Allows users to view their own non-deleted split sheets';

COMMENT ON POLICY "Users can insert their own split sheets" ON split_sheets
  IS 'Allows users to create new split sheets';

COMMENT ON POLICY "Collaborators can view split sheets they're part of" ON split_sheets
  IS 'Allows collaborators to view non-deleted split sheets they are part of';

COMMENT ON POLICY "Users can update their own split sheets" ON split_sheets
  IS 'Allows users to update their own non-deleted split sheets';

COMMENT ON POLICY "Users can soft delete their own split sheets" ON split_sheets
  IS 'Allows users to soft delete their own split sheets';

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_split_sheets_user_deleted
ON split_sheets(user_id, deleted_at)
WHERE deleted_at IS NULL;