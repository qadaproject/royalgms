-- Create SeatingZones table
CREATE TABLE IF NOT EXISTS seating_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  categories_allowed TEXT[] DEFAULT '{}',
  description TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_seating_zones_name ON seating_zones(name);

-- Enable RLS
ALTER TABLE seating_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view zones" ON seating_zones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert zones" ON seating_zones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update zones" ON seating_zones
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete zones" ON seating_zones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
