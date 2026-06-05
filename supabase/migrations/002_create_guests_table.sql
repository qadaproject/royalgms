-- Create Guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formal_salutation TEXT,
  full_name TEXT NOT NULL,
  official_title TEXT,
  post_nominals TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'A - Royal',
    'B - Federal',
    'C - State',
    'D - Corporate',
    'E - Diplomatic',
    'F - Traditional',
    'G - General',
    'H - Socials',
    'I - Communities',
    'J - Chiefs'
  )),
  email TEXT,
  phone TEXT,
  contact_person_name TEXT,
  contact_person_phone TEXT,
  contact_person_email TEXT,
  rsvp_status TEXT DEFAULT 'Pending' CHECK (rsvp_status IN ('Pending', 'Accepted', 'Declined', 'Proxy')),
  dietary_requirements TEXT,
  medical_alerts TEXT,
  security_detail_size INTEGER DEFAULT 0,
  arrival_details TEXT,
  seating_zone TEXT,
  seat_number TEXT,
  special_requirements TEXT,
  qr_code TEXT UNIQUE,
  rsvp_token TEXT UNIQUE,
  protocol_validated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_guests_full_name ON guests(full_name);
CREATE INDEX idx_guests_category ON guests(category);
CREATE INDEX idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_qr_code ON guests(qr_code);
CREATE INDEX idx_guests_rsvp_token ON guests(rsvp_token);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view guests" ON guests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert guests" ON guests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update guests" ON guests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete guests" ON guests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
