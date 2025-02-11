-- Create function to process email queue
CREATE OR REPLACE FUNCTION process_email_queue(
  max_emails integer DEFAULT 50,  -- Maximum number of emails to process in one batch
  retry_after interval DEFAULT interval '5 minutes'  -- How long to wait before retrying failed emails
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_processed integer := 0;
  v_record record;
  v_template record;
  v_user record;
  v_email_body text;
  v_email_subject text;
  v_dashboard_link text;
BEGIN
  -- Set dashboard link
  v_dashboard_link := current_setting('app.frontend_url') || '/dashboard';

  -- Process pending emails
  FOR v_record IN (
    SELECT e.*
    FROM email_events e
    WHERE e.status = 'pending'
      OR (e.status = 'error' AND e.created_at < now() - retry_after)
    ORDER BY e.created_at
    LIMIT max_emails
    FOR UPDATE SKIP LOCKED
  ) LOOP
    BEGIN
      -- Get user info
      SELECT email, raw_user_meta_data->>'full_name' as name
      INTO v_user
      FROM auth.users
      WHERE id = v_record.user_id;

      -- Get email template based on type
      SELECT *
      INTO v_template
      FROM email_templates
      WHERE name = 
        CASE v_record.email_type
          WHEN 'welcome' THEN 'welcome_email'
          ELSE v_record.email_type
        END;

      -- Prepare email content
      v_email_body := v_template.body;
      v_email_subject := v_template.subject;

      -- Replace template variables
      v_email_body := replace(v_email_body, '{{ user_name }}', COALESCE(v_user.name, 'there'));
      v_email_body := replace(v_email_body, '{{ dashboard_link }}', v_dashboard_link);

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
          'template_name', v_record.email_type,
          'template_data', jsonb_build_object(
            'body', v_email_body
          )
        )
      );

      -- Update email event status
      UPDATE email_events
      SET status = 'sent',
          processed_at = now(),
          error = NULL
      WHERE id = v_record.id;

      v_processed := v_processed + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Update email event with error
        UPDATE email_events
        SET status = 'error',
            processed_at = now(),
            error = SQLERRM
        WHERE id = v_record.id;
    END;
  END LOOP;

  RETURN v_processed;
END;
$$;

-- Create function to retry failed emails
CREATE OR REPLACE FUNCTION retry_failed_emails()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE email_events
  SET status = 'pending',
      processed_at = NULL,
      error = NULL
  WHERE status = 'error'
  AND created_at > now() - interval '24 hours'
  RETURNING count(*) INTO v_count;

  RETURN v_count;
END;
$$;

-- Create function to clean up old email events
CREATE OR REPLACE FUNCTION cleanup_email_events(
  retention_days integer DEFAULT 30
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM email_events
  WHERE created_at < now() - (retention_days || ' days')::interval
  AND status IN ('sent', 'error')
  RETURNING count(*) INTO v_count;

  RETURN v_count;
END;
$$;

-- Add comments
COMMENT ON FUNCTION process_email_queue IS 'Processes pending emails in the queue';
COMMENT ON FUNCTION retry_failed_emails IS 'Resets failed emails to pending status for retry';
COMMENT ON FUNCTION cleanup_email_events IS 'Removes old email events based on retention period';