-- Update split sheets policies to allow collaborators to view
DROP POLICY IF EXISTS "split_sheets_owner_select" ON split_sheets;
DROP POLICY IF EXISTS "split_sheets_collaborator_select" ON split_sheets;

CREATE POLICY "split_sheets_owner_select"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "split_sheets_collaborator_select"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborators
      WHERE collaborators.split_sheet_id = id
      AND collaborators.email = auth.jwt() ->> 'email'
      AND deleted_at IS NULL
    )
  );

-- Update collaborators policies to allow collaborators to view their own records
DROP POLICY IF EXISTS "collaborators_owner_select" ON collaborators;
DROP POLICY IF EXISTS "collaborators_self_select" ON collaborators;

CREATE POLICY "collaborators_owner_select"
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