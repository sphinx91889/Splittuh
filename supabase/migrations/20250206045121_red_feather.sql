-- Drop existing policies
DROP POLICY IF EXISTS "split_sheets_owner_select" ON split_sheets;
DROP POLICY IF EXISTS "split_sheets_collaborator_select" ON split_sheets;
DROP POLICY IF EXISTS "collaborators_owner_select" ON collaborators;
DROP POLICY IF EXISTS "collaborators_self_select" ON collaborators;

-- Create new non-recursive policies for split_sheets
CREATE POLICY "split_sheets_owner_select"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "split_sheets_collaborator_select"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT split_sheet_id 
      FROM collaborators 
      WHERE email = auth.jwt() ->> 'email'
    )
    AND deleted_at IS NULL
  );

-- Create new non-recursive policies for collaborators
CREATE POLICY "collaborators_owner_select"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "collaborators_self_select"
  ON collaborators FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Add comments
COMMENT ON POLICY "split_sheets_owner_select" ON split_sheets
  IS 'Allow users to view their own split sheets';

COMMENT ON POLICY "split_sheets_collaborator_select" ON split_sheets
  IS 'Allow collaborators to view split sheets they are part of';

COMMENT ON POLICY "collaborators_owner_select" ON collaborators
  IS 'Allow split sheet owners to view all collaborators';

COMMENT ON POLICY "collaborators_self_select" ON collaborators
  IS 'Allow collaborators to view their own records';