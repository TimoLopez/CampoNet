-- Migration: Add visitas_coordinadas table
-- Tracks scheduled PHYSICAL property tours (distinct from the `visitas` table,
-- which logs digital page views of a campo's public ficha).

CREATE TABLE IF NOT EXISTS visitas_coordinadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campo_id UUID NOT NULL REFERENCES campos(id) ON DELETE CASCADE,
  escritorio_id UUID NOT NULL REFERENCES escritorios(id) ON DELETE CASCADE,
  fecha_hora TIMESTAMPTZ NOT NULL,
  estado TEXT NOT NULL DEFAULT 'programada'
    CHECK (estado IN ('programada', 'realizada', 'cancelada')),
  notas TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visitas_coordinadas_lead_id_idx ON visitas_coordinadas(lead_id);
CREATE INDEX IF NOT EXISTS visitas_coordinadas_campo_id_idx ON visitas_coordinadas(campo_id);
CREATE INDEX IF NOT EXISTS visitas_coordinadas_escritorio_id_idx ON visitas_coordinadas(escritorio_id);
CREATE INDEX IF NOT EXISTS visitas_coordinadas_fecha_hora_idx ON visitas_coordinadas(fecha_hora);

ALTER TABLE visitas_coordinadas ENABLE ROW LEVEL SECURITY;

-- Escritorio can read its own scheduled visits
CREATE POLICY "escritorios_select_visitas_coordinadas" ON visitas_coordinadas
  FOR SELECT TO authenticated
  USING (escritorio_id = auth.uid());

-- Escritorio can schedule new visits for its own leads
CREATE POLICY "escritorios_insert_visitas_coordinadas" ON visitas_coordinadas
  FOR INSERT TO authenticated
  WITH CHECK (escritorio_id = auth.uid());

-- Escritorio can update estado/notas of its own visits (mark realizada/cancelada)
CREATE POLICY "escritorios_update_visitas_coordinadas" ON visitas_coordinadas
  FOR UPDATE TO authenticated
  USING (escritorio_id = auth.uid());
