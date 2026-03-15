CREATE TABLE lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_name TEXT NOT NULL DEFAULT 'System',
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'note' CHECK (note_type IN ('note', 'call', 'email', 'status_change', 'meeting')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_notes_lead ON lead_notes(lead_id);
CREATE INDEX idx_lead_notes_created ON lead_notes(created_at DESC);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_notes_service ON lead_notes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY lead_notes_select ON lead_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('team', 'admin')));
