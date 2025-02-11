/*
  # Clean up tables and policies

  1. Changes
    - Safely drop signatures and collaborators tables if they exist
    - Remove related policies
  
  2. Notes
    - Uses DO block to handle non-existent tables gracefully
    - Ensures clean removal of all related objects
*/

DO $$ 
BEGIN
  -- Drop tables if they exist
  DROP TABLE IF EXISTS signatures CASCADE;
  DROP TABLE IF EXISTS collaborators CASCADE;
  
  -- Clean up policies
  -- Note: We don't need to explicitly drop the policies as they are dropped with CASCADE
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;