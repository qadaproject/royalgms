-- Create EventHistory table
CREATE TABLE IF NOT EXISTS event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_subtitle TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  total_invited INTEGER,
  total_attended INTEGER,
  rsvp_accepted INTEGER,
  rsvp_declined INTEGER,
  rsvp_pending INTEGER,
  rsvp_proxy INTEGER,
  category_breakdown TEXT,
  notes TEXT,
  archived_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_event_history_event_date ON event_history(event_date DESC);
CREATE INDEX idx_event_history_event_name ON event_history(event_name);

-- Enable RLS
ALTER TABLE event_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view event history" ON event_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert event history" ON event_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete event history" ON event_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
