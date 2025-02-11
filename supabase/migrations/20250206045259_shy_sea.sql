-- Drop existing policies
DROP POLICY IF EXISTS "split_sheets_owner_select" ON split_sheets;
DROP POLICY IF EXISTS "split_sheets_collaborator_select" ON split_sheets;
DROP POLICY IF EXISTS "split_sheets_owner_insert" ON split_sheets;
DROP POLICY IF EXISTS "split_sheets_owner_update" ON split_sheets;
DROP POLICY IF EXISTS "collaborators_owner_select" ON collaborators;
DROP POLICY IF EXISTS "collaborators_self_select" ON collaborators;
DROP POLICY IF EXISTS "collaborators_owner_insert" ON collaborators;
DROP POLICY IF EXISTS "collaborators_owner_update" ON collaborators;
DROP POLICY IF EXISTS "collaborators_self_update" ON collaborators;

-- Create simplified policies for split_sheets
CREATE POLICY "view_split_sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid() OR 
    id IN (
      SELECT split_sheet_id 
      FROM collaborators 
      WHERE email = auth.jwt() ->> 'email'
    ))
    AND deleted_at IS NULL
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

-- Create simplified policies for collaborators
CREATE POLICY "view_collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
    OR email = auth.jwt() ->> 'email'
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
    )
    OR email = auth.jwt() ->> 'email'
  )
  WITH CHECK (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
    OR email = auth.jwt() ->> 'email'
  );

-- Add comments
COMMENT ON POLICY "view_split_sheets" ON split_sheets
  IS 'Allow users to view their own split sheets and ones they collaborate on';

COMMENT ON POLICY "insert_split_sheets" ON split_sheets
  IS 'Allow users to create new split sheets';

COMMENT ON POLICY "update_split_sheets" ON split_sheets
  IS 'Allow users to update their own split sheets';

COMMENT ON POLICY "view_collaborators" ON collaborators
  IS 'Allow users to view collaborators for their split sheets and their own collaborator records';

COMMENT ON POLICY "insert_collaborators" ON collaborators
  IS 'Allow split sheet owners to add collaborators';

COMMENT ON POLICY "update_collaborators" ON collaborators
  IS 'Allow split sheet owners to update collaborators and collaborators to update their own records';