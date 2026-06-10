-- Migration: Add consultas table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campo_id UUID REFERENCES campos(id) ON DELETE SET NULL,
  escritorio_id UUID NOT NULL REFERENCES escritorios(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS consultas_lead_id_idx ON consultas(lead_id);
CREATE INDEX IF NOT EXISTS consultas_escritorio_id_idx ON consultas(escritorio_id);

ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escritorios_select_consultas" ON consultas
  FOR SELECT TO authenticated
  USING (escritorio_id = auth.uid());

-- Backfill: migrate existing lead messages to consultas
-- This preserves the original timestamp and keeps historical data
INSERT INTO consultas (lead_id, campo_id, escritorio_id, mensaje, created_at)
SELECT
  l.id,
  l.campo_id,
  l.escritorio_id,
  l.mensaje,
  l.created_at
FROM leads l
WHERE l.mensaje IS NOT NULL
  AND l.mensaje != ''
  AND l.campo_id IS NOT NULL;
