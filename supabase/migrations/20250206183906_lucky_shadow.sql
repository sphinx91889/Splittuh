-- Create a test function to verify email template and trigger
CREATE OR REPLACE FUNCTION test_welcome_email()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template record;
BEGIN
  -- Check if welcome email template exists
  SELECT * INTO v_template
  FROM email_templates
  WHERE name = 'welcome_email';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Welcome email template not found';
  END IF;

  -- Check if trigger exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE EXCEPTION 'Welcome email trigger not found';
  END IF;

  RETURN true;
END;
$$;

-- Run the test
SELECT test_welcome_email();

-- Add comment
COMMENT ON FUNCTION test_welcome_email IS 'Tests the welcome email setup';