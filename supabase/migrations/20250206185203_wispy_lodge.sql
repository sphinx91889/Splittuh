-- Create function to process email queue with unique name
CREATE OR REPLACE FUNCTION process_email_queue_v2(
  max_emails integer DEFAULT 50
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_processed integer := 0;
  v_record record;
BEGIN
  FOR v_record IN (
    SELECT * FROM email_events
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT max_emails
    FOR UPDATE SKIP LOCKED
  ) LOOP
    BEGIN
      -- Process email logic here
      UPDATE email_events
      SET status = 'processing',
          processed_at = now()
      WHERE id = v_record.id;

      v_processed := v_processed + 1;
    EXCEPTION
      WHEN OTHERS THEN
        UPDATE email_events
        SET status = 'error',
            error = SQLERRM
        WHERE id = v_record.id;
    END;
  END LOOP;

  RETURN v_processed;
END;
$$;

-- Create function to retry failed emails with unique name
CREATE OR REPLACE FUNCTION retry_failed_emails_v2()
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

-- Create function to clean up old email events with unique name
CREATE OR REPLACE FUNCTION cleanup_email_events_v2(
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_events_pending_v2 
ON email_events(created_at) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_events_error_v2 
ON email_events(created_at) 
WHERE status = 'error';

-- Add comments
COMMENT ON FUNCTION process_email_queue_v2 IS 'Processes a batch of pending emails';
COMMENT ON FUNCTION retry_failed_emails_v2 IS 'Resets failed emails to pending status';
COMMENT ON FUNCTION cleanup_email_events_v2 IS 'Removes old email events';
COMMENT ON INDEX idx_email_events_pending_v2 IS 'Index for finding pending emails efficiently';
COMMENT ON INDEX idx_email_events_error_v2 IS 'Index for finding failed emails efficiently';