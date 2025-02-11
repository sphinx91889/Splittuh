-- Create or replace welcome email function with simplified error handling
CREATE OR REPLACE FUNCTION send_welcome_email(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user record;
  v_template record;
  v_email_body text;
  v_email_subject text;
BEGIN
  -- Get user info with error handling
  BEGIN
    SELECT email, raw_user_meta_data->>'full_name' as name
    INTO STRICT v_user
    FROM auth.users
    WHERE id = user_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE WARNING 'User not found';
      RETURN false;
    WHEN TOO_MANY_ROWS THEN
      RAISE WARNING 'Multiple users found';
      RETURN false;
  END;

  -- Get email template with error handling
  BEGIN
    SELECT * INTO STRICT v_template
    FROM email_templates
    WHERE name = 'welcome_email';
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE WARNING 'Welcome email template not found';
      RETURN false;
  END;

  -- Replace template variables
  v_email_body := replace(v_template.body, '{{ user_name }}', COALESCE(v_user.name, 'there'));
  v_email_subject := v_template.subject;

  -- Return true to indicate success (actual email sending will be handled by Supabase)
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any other errors but don't block user creation
    RAISE WARNING 'Error in send_welcome_email: %', SQLERRM;
    RETURN false;
END;
$$;

-- Update new user handler with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Attempt to send welcome email but don't block on failure
  BEGIN
    PERFORM send_welcome_email(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Add comments
COMMENT ON FUNCTION send_welcome_email IS 'Prepares welcome email for newly registered users with improved error handling';
COMMENT ON FUNCTION handle_new_user IS 'Handles new user registration with graceful error handling';