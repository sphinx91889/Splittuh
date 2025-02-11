-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS send_welcome_email(uuid) CASCADE;
DROP FUNCTION IF EXISTS test_welcome_email() CASCADE;

-- Create a table to track email events if it doesn't exist
CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error text
);

-- Enable RLS if not already enabled
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their own email events" ON email_events;

-- Create policy for email events
CREATE POLICY "Users can view their own email events"
  ON email_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to queue welcome email
CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO email_events (user_id, email_type)
  VALUES (NEW.id, 'welcome');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

-- Add indexes (IF NOT EXISTS to prevent errors if they already exist)
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);

-- Add comments
COMMENT ON TABLE email_events IS 'Tracks email sending events';
COMMENT ON FUNCTION queue_welcome_email IS 'Queues welcome email for new users';