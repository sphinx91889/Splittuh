-- Create welcome email template
INSERT INTO email_templates (name, subject, body) VALUES
(
  'welcome_email',
  'Welcome to Split Sheet Generator!',
  'Hello {{ user_name }},

Thank you for joining Split Sheet Generator! We''re excited to help you manage your music collaborations professionally and efficiently.

With Split Sheet Generator, you can:
- Create professional split sheets
- Collect digital signatures
- Track ownership and rights
- Manage collaborations easily

Get started by creating your first split sheet:
{{ dashboard_link }}

If you have any questions, feel free to reach out to our support team.

Best regards,
Split Sheet Generator Team'
);

-- Create function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user record;
  v_template record;
  v_dashboard_link text;
  v_email_body text;
  v_email_subject text;
BEGIN
  -- Get user info
  SELECT email, raw_user_meta_data->>'full_name' as name
  INTO v_user
  FROM auth.users
  WHERE id = user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get email template
  SELECT * INTO v_template
  FROM email_templates
  WHERE name = 'welcome_email';

  -- Generate dashboard link
  v_dashboard_link := current_setting('app.frontend_url') || '/dashboard';

  -- Replace template variables
  v_email_body := replace(v_template.body, '{{ user_name }}', COALESCE(v_user.name, 'there'));
  v_email_body := replace(v_email_body, '{{ dashboard_link }}', v_dashboard_link);
  
  v_email_subject := v_template.subject;

  -- Send email using Supabase Auth
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/auth/v1/admin/send-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'email', v_user.email,
      'subject', v_email_subject,
      'template_name', 'welcome_email',
      'template_data', jsonb_build_object(
        'body', v_email_body
      )
    )
  );

  RETURN true;
END;
$$;

-- Create trigger to send welcome email on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send welcome email
  PERFORM send_welcome_email(NEW.id);
  RETURN NEW;
END;
$$;

-- Add trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comments
COMMENT ON FUNCTION send_welcome_email IS 'Sends a welcome email to newly registered users';
COMMENT ON FUNCTION handle_new_user IS 'Handles new user registration by sending welcome email';