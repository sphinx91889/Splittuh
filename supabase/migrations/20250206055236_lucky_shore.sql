-- Create signature_requests table
CREATE TABLE signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid REFERENCES collaborators(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  reminder_sent_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired'))
);

-- Enable RLS
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view signature requests for their split sheets"
  ON signature_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborators c
      JOIN split_sheets s ON s.id = c.split_sheet_id
      WHERE c.id = signature_requests.collaborator_id
      AND (s.user_id = auth.uid() OR c.email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Users can create signature requests for their split sheets"
  ON signature_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborators c
      JOIN split_sheets s ON s.id = c.split_sheet_id
      WHERE c.id = signature_requests.collaborator_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update signature requests for their split sheets"
  ON signature_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborators c
      JOIN split_sheets s ON s.id = c.split_sheet_id
      WHERE c.id = signature_requests.collaborator_id
      AND (s.user_id = auth.uid() OR c.email = auth.jwt() ->> 'email')
    )
  );

-- Create indexes
CREATE INDEX idx_signature_requests_collaborator ON signature_requests(collaborator_id);
CREATE INDEX idx_signature_requests_status ON signature_requests(status);

-- Add comments
COMMENT ON TABLE signature_requests IS 'Tracks signature requests and reminders';
COMMENT ON COLUMN signature_requests.sent_at IS 'When the initial request was sent';
COMMENT ON COLUMN signature_requests.reminder_sent_at IS 'When the last reminder was sent';
COMMENT ON COLUMN signature_requests.completed_at IS 'When the signature was completed';
COMMENT ON COLUMN signature_requests.status IS 'Current status of the signature request';