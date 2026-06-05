-- Create NotificationLog table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN (
    'Email',
    'SMS',
    'WhatsApp',
    'Email + SMS',
    'Email + WhatsApp'
  )),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Sent', 'Failed', 'Pending')),
  message_preview TEXT,
  rsvp_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notification_logs_guest_id ON notification_logs(guest_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notification logs" ON notification_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert notification logs" ON notification_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
