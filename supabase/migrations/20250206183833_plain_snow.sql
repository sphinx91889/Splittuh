-- Create welcome email template if it doesn't exist
INSERT INTO email_templates (name, subject, body)
VALUES (
  'welcome_email',
  'Welcome to Split Sheet Generator!',
  'Hello {{ user_name }},

Welcome to Split Sheet Generator! We''re excited to help you manage your music collaborations professionally and efficiently.

With Split Sheet Generator, you can:
• Create professional split sheets
• Collect digital signatures
• Track ownership and rights
• Manage collaborations easily

Get started by visiting your dashboard:
{{ dashboard_link }}

Best regards,
Split Sheet Generator Team'
)
ON CONFLICT (name) 
DO UPDATE SET 
  body = EXCLUDED.body,
  subject = EXCLUDED.subject;

-- Create function to send welcome email with simplified approach
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

  -- Return true to indicate success (actual email sending will be handled by Edge Functions)
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in send_welcome_email: %', SQLERRM;
    RETURN false;
END;
$$;

-- Create trigger function for new users
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comments
COMMENT ON FUNCTION send_welcome_email IS 'Prepares welcome email for newly registered users';
COMMENT ON FUNCTION handle_new_user IS 'Handles new user registration events';