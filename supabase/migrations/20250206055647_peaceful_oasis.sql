-- Create email templates table
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for reading templates
CREATE POLICY "Anyone can read email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body) VALUES
(
  'signature_request',
  '[ACTION REQUIRED] Your signature is needed for {{ song_title }} split sheet',
  'Hello {{ collaborator_name }},

You have been requested to sign the split sheet for "{{ song_title }}".

Please click the link below to review and sign the split sheet:
{{ signature_link }}

This link will expire in 7 days.

Best regards,
Split Sheet Generator Team'
),
(
  'signature_reminder',
  'REMINDER: Your signature is needed for {{ song_title }} split sheet',
  'Hello {{ collaborator_name }},

This is a reminder that your signature is still needed for the "{{ song_title }}" split sheet.

Please click the link below to review and sign the split sheet:
{{ signature_link }}

This link will expire in 7 days.

Best regards,
Split Sheet Generator Team'
),
(
  'signature_confirmation',
  'Split sheet for {{ song_title }} has been signed',
  'Hello {{ owner_name }},

{{ collaborator_name }} has signed the split sheet for "{{ song_title }}".

You can view the signed split sheet here:
{{ split_sheet_link }}

Best regards,
Split Sheet Generator Team'
);

-- Create function to send signature request email
CREATE OR REPLACE FUNCTION send_signature_request_email(
  p_collaborator_id uuid,
  p_template_name text DEFAULT 'signature_request'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_collaborator record;
  v_split_sheet record;
  v_template record;
  v_owner record;
  v_signature_link text;
  v_email_body text;
  v_email_subject text;
BEGIN
  -- Get collaborator and split sheet info
  SELECT c.*, s.* INTO v_collaborator
  FROM collaborators c
  JOIN split_sheets s ON s.id = c.split_sheet_id
  WHERE c.id = p_collaborator_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get owner info
  SELECT email INTO v_owner
  FROM auth.users
  WHERE id = v_collaborator.user_id;

  -- Get email template
  SELECT * INTO v_template
  FROM email_templates
  WHERE name = p_template_name;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Generate signature link
  v_signature_link := current_setting('app.frontend_url') || '/split-sheet/' || v_collaborator.split_sheet_id;

  -- Replace template variables
  v_email_body := replace(v_template.body, '{{ collaborator_name }}', v_collaborator.legal_name);
  v_email_body := replace(v_email_body, '{{ song_title }}', v_collaborator.title);
  v_email_body := replace(v_email_body, '{{ signature_link }}', v_signature_link);
  
  v_email_subject := replace(v_template.subject, '{{ song_title }}', v_collaborator.title);

  -- Send email using Supabase Auth
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/auth/v1/admin/send-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'email', v_collaborator.email,
      'subject', v_email_subject,
      'template_name', p_template_name,
      'template_data', jsonb_build_object(
        'body', v_email_body
      )
    )
  );

  -- Create or update signature request record
  INSERT INTO signature_requests (collaborator_id, sent_at, status)
  VALUES (p_collaborator_id, now(), 'pending')
  ON CONFLICT (collaborator_id) 
  DO UPDATE SET 
    sent_at = now(),
    reminder_sent_at = NULL,
    status = 'pending';

  RETURN true;
END;
$$;

-- Create function to send signature reminder email
CREATE OR REPLACE FUNCTION send_signature_reminder_email(p_signature_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM send_signature_request_email(
    (SELECT collaborator_id FROM signature_requests WHERE id = p_signature_request_id),
    'signature_reminder'
  );
  
  UPDATE signature_requests 
  SET reminder_sent_at = now()
  WHERE id = p_signature_request_id;
  
  RETURN true;
END;
$$;

-- Create function to send signature confirmation email
CREATE OR REPLACE FUNCTION send_signature_confirmation_email(p_collaborator_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_collaborator record;
  v_split_sheet record;
  v_template record;
  v_owner record;
  v_split_sheet_link text;
  v_email_body text;
  v_email_subject text;
BEGIN
  -- Get collaborator and split sheet info
  SELECT c.*, s.* INTO v_collaborator
  FROM collaborators c
  JOIN split_sheets s ON s.id = c.split_sheet_id
  WHERE c.id = p_collaborator_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get owner info
  SELECT email, raw_user_meta_data->>'full_name' as name INTO v_owner
  FROM auth.users
  WHERE id = v_collaborator.user_id;

  -- Get email template
  SELECT * INTO v_template
  FROM email_templates
  WHERE name = 'signature_confirmation';

  -- Generate split sheet link
  v_split_sheet_link := current_setting('app.frontend_url') || '/split-sheet/' || v_collaborator.split_sheet_id;

  -- Replace template variables
  v_email_body := replace(v_template.body, '{{ owner_name }}', COALESCE(v_owner.name, 'there'));
  v_email_body := replace(v_email_body, '{{ collaborator_name }}', v_collaborator.legal_name);
  v_email_body := replace(v_email_body, '{{ song_title }}', v_collaborator.title);
  v_email_body := replace(v_email_body, '{{ split_sheet_link }}', v_split_sheet_link);
  
  v_email_subject := replace(v_template.subject, '{{ song_title }}', v_collaborator.title);

  -- Send email using Supabase Auth
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/auth/v1/admin/send-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'email', v_owner.email,
      'subject', v_email_subject,
      'template_name', 'signature_confirmation',
      'template_data', jsonb_build_object(
        'body', v_email_body
      )
    )
  );

  -- Update signature request status
  UPDATE signature_requests 
  SET status = 'completed', completed_at = now()
  WHERE collaborator_id = p_collaborator_id;

  RETURN true;
END;
$$;

-- Add comments
COMMENT ON TABLE email_templates IS 'Stores email templates for signature requests and notifications';
COMMENT ON FUNCTION send_signature_request_email IS 'Sends a signature request email to a collaborator';
COMMENT ON FUNCTION send_signature_reminder_email IS 'Sends a reminder email for pending signatures';
COMMENT ON FUNCTION send_signature_confirmation_email IS 'Sends a confirmation email when a signature is completed';