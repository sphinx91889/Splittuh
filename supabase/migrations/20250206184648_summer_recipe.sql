-- Create a function to send emails through custom SMTP
CREATE OR REPLACE FUNCTION send_email(
  p_to text,
  p_subject text,
  p_body text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into email_events for tracking
  INSERT INTO email_events (
    user_id,
    email_type,
    status,
    metadata
  )
  VALUES (
    auth.uid(),
    'custom_smtp',
    'sent',
    jsonb_build_object(
      'to', p_to,
      'subject', p_subject,
      'sent_at', now()
    )
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't throw
    INSERT INTO email_events (
      user_id,
      email_type,
      status,
      error
    )
    VALUES (
      auth.uid(),
      'custom_smtp',
      'error',
      SQLERRM
    );
    
    RETURN false;
END;
$$;

-- Add metadata column to email_events if it doesn't exist
ALTER TABLE email_events 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create index on metadata
CREATE INDEX IF NOT EXISTS idx_email_events_metadata 
ON email_events USING gin (metadata);

-- Add comment
COMMENT ON FUNCTION send_email IS 'Sends an email using custom SMTP configuration';