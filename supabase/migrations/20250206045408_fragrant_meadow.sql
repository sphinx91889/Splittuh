-- Drop all existing policies
DROP POLICY IF EXISTS "view_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "insert_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "update_split_sheets" ON split_sheets;
DROP POLICY IF EXISTS "view_collaborators" ON collaborators;
DROP POLICY IF EXISTS "insert_collaborators" ON collaborators;
DROP POLICY IF EXISTS "update_collaborators" ON collaborators;

-- Create basic split sheets policies
CREATE POLICY "view_own_split_sheets"
  ON split_sheets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "view_collaborated_split_sheets"
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

CREATE POLICY "create_split_sheets"
  ON split_sheets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_split_sheets"
  ON split_sheets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create basic collaborators policies
CREATE POLICY "view_own_collaborations"
  ON collaborators FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "view_split_sheet_collaborators"
  ON collaborators FOR SELECT
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "create_collaborators"
  ON collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "update_own_collaboration"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

CREATE POLICY "owner_update_collaborators"
  ON collaborators FOR UPDATE
  TO authenticated
  USING (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    split_sheet_id IN (
      SELECT id 
      FROM split_sheets 
      WHERE user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON POLICY "view_own_split_sheets" ON split_sheets
  IS 'Allow users to view their own split sheets';

COMMENT ON POLICY "view_collaborated_split_sheets" ON split_sheets
  IS 'Allow users to view split sheets they collaborate on';

COMMENT ON POLICY "create_split_sheets" ON split_sheets
  IS 'Allow users to create new split sheets';

COMMENT ON POLICY "update_own_split_sheets" ON split_sheets
  IS 'Allow users to update their own split sheets';

COMMENT ON POLICY "view_own_collaborations" ON collaborators
  IS 'Allow users to view their own collaborator records';

COMMENT ON POLICY "view_split_sheet_collaborators" ON collaborators
  IS 'Allow split sheet owners to view all collaborators';

COMMENT ON POLICY "create_collaborators" ON collaborators
  IS 'Allow split sheet owners to add collaborators';

COMMENT ON POLICY "update_own_collaboration" ON collaborators
  IS 'Allow collaborators to update their own records';

COMMENT ON POLICY "owner_update_collaborators" ON collaborators
  IS 'Allow split sheet owners to update any collaborator records';