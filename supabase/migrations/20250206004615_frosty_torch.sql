/*
  # Fix split sheet deletion policy

  1. Changes
    - Simplify RLS policies for updates
    - Add policy for soft deletes that properly handles deleted_at column
*/

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update their own split sheets" ON split_sheets;
DROP POLICY IF EXISTS "Users can soft delete their own split sheets" ON split_sheets;

-- Create a single update policy that handles both updates and soft deletes
CREATE POLICY "Users can update their own split sheets"
  ON split_sheets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment explaining the policy
COMMENT ON POLICY "Users can update their own split sheets" ON split_sheets
  IS 'Allows users to update their own split sheets, including soft deletion via deleted_at';