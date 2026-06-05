-- Create GuestActivityLog table
CREATE TABLE IF NOT EXISTS guest_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'invitation_dispatched',
    'delivery_status_changed',
    'rsvp_status_changed',
    'notification_sent',
    'zone_assigned',
    'protocol_validated'
  )),
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_guest_activity_logs_guest_id ON guest_activity_logs(guest_id);
CREATE INDEX idx_guest_activity_logs_event_type ON guest_activity_logs(event_type);
CREATE INDEX idx_guest_activity_logs_created_at ON guest_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE guest_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity logs" ON guest_activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activity logs" ON guest_activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
