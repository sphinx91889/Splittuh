/*
  # Fix split sheet deletion policy

  1. Changes
    - Add specific policy for soft deletion
    - Ensure proper RLS for update operations
    - Maintain data integrity with user checks
*/

-- Drop existing update policies
DROP POLICY IF EXISTS "Users can update their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Users can soft delete their own split sheets" ON split_sheets;

-- Create separate policies for updates and soft deletes
CREATE POLICY "Users can update their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (
    auth.uid() = user_id 
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can soft delete their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
  );

-- Add comments explaining the policies
COMMENT ON POLICY "Users can update their own split sheets" ON split_sheets
  IS 'Allows users to update their own active split sheets';

COMMENT ON POLICY "Users can soft delete their own split sheets" ON split_sheets
  IS 'Allows users to soft delete their own split sheets by setting deleted_at';