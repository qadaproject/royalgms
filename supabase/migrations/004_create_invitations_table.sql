-- Create Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_category TEXT NOT NULL,
  dispatch_type TEXT NOT NULL CHECK (dispatch_type IN (
    'Physical - Hand Delivered',
    'Physical - Courier',
    'Digital - Email',
    'Digital - SMS'
  )),
  tier TEXT NOT NULL CHECK (tier IN (
    'Tier 1 - Gold Foil',
    'Tier 2 - Wax Seal',
    'Tier 3 - Digital'
  )),
  delivery_status TEXT DEFAULT 'Pending' CHECK (delivery_status IN (
    'Pending',
    'Out for Delivery',
    'Delivered',
    'Returned',
    'Failed'
  )),
  delivered_date DATE,
  dispatch_notes TEXT,
  courier_name TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invitations_guest_id ON invitations(guest_id);
CREATE INDEX idx_invitations_delivery_status ON invitations(delivery_status);
CREATE INDEX idx_invitations_dispatch_type ON invitations(dispatch_type);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invitations" ON invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update invitations" ON invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete invitations" ON invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
