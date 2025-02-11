/*
  # Add additional columns to split sheets table

  1. Changes
    - Add status column for tracking split sheet state
    - Add version column for tracking document versions
    - Add metadata column for additional flexible data storage
    - Add indexes for performance optimization

  2. Security
    - No changes to existing RLS policies
    - All new columns inherit existing RLS
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add status column for tracking the state of the split sheet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'split_sheets' AND column_name = 'status'
  ) THEN
    ALTER TABLE split_sheets 
    ADD COLUMN status text DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_signatures', 'completed', 'archived'));
  END IF;

  -- Add version tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'split_sheets' AND column_name = 'version'
  ) THEN
    ALTER TABLE split_sheets 
    ADD COLUMN version integer DEFAULT 1;
  END IF;

  -- Add metadata for flexible additional data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'split_sheets' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE split_sheets 
    ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS split_sheets_status_idx ON split_sheets(status);
CREATE INDEX IF NOT EXISTS split_sheets_version_idx ON split_sheets(version);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS split_sheets_user_status_idx 
ON split_sheets(user_id, status);

COMMENT ON COLUMN split_sheets.status IS 'Current state of the split sheet document';
COMMENT ON COLUMN split_sheets.version IS 'Version number of the split sheet document';
COMMENT ON COLUMN split_sheets.metadata IS 'Additional flexible metadata for the split sheet';