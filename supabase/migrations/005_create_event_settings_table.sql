-- Create EventSettings table
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_subtitle TEXT,
  event_date DATE,
  event_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  dress_code TEXT,
  invitation_body TEXT,
  email_template TEXT,
  sms_template TEXT,
  email_subject TEXT,
  rsvp_deadline DATE,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  footer_note TEXT,
  additional_venues TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view event settings" ON event_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert event settings" ON event_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update event settings" ON event_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete event settings" ON event_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
