-- Drop all existing policies
DROP POLICY IF EXISTS "select_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "insert_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "update_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "select_collaborators" ON collaborators;
DROP POLICY IF EXISTS "insert_collaborators" ON collaborators;
DROP POLICY IF EXISTS "update_collaborators" ON collaborators;

-- Create non-recursive split sheets policies
CREATE POLICY "select_split_sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND (
      user_id = auth.uid() OR
      id IN (
        SELECT split_sheet_id
        FROM collaborators
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "insert_split_sheets"
  ON split_sheets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_split_sheets"
  ON split_sheets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create non-recursive collaborators policies
CREATE POLICY "select_collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id
      FROM split_sheets
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    ) OR
    email = auth.jwt() ->> 'email'
  );

CREATE POLICY "insert_collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    split_sheet_id IN (
      SELECT id
      FROM split_sheets
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "update_collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id
      FROM split_sheets
      WHERE user_id = auth.uid()
    ) OR
    email = auth.jwt() ->> 'email'
  )
  WITH CHECK (
    split_sheet_id IN (
      SELECT id
      FROM split_sheets
      WHERE user_id = auth.uid()
    ) OR
    email = auth.jwt() ->> 'email'
  );

-- Add comments
COMMENT ON POLICY "select_split_sheets" ON split_sheets
  IS 'Users can view their own split sheets and ones they collaborate on';

COMMENT ON POLICY "insert_split_sheets" ON split_sheets
  IS 'Users can create their own split sheets';

COMMENT ON POLICY "update_split_sheets" ON split_sheets
  IS 'Users can update their own split sheets';

COMMENT ON POLICY "select_collaborators" ON collaborators
  IS 'Users can view collaborators for their split sheets and their own collaborator records';

COMMENT ON POLICY "insert_collaborators" ON collaborators
  IS 'Users can add collaborators to their own split sheets';

COMMENT ON POLICY "update_collaborators" ON collaborators
  IS 'Users can update collaborators on their split sheets and their own collaborator records';