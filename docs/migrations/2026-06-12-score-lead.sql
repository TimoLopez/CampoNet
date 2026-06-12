-- Migration: Add AI score fields to leads
-- score: 0-100 integer, null = not yet scored
-- score_categoria: frio | tibio | caliente
-- score_justificacion: one-line explanation from GPT
-- score_updated_at: timestamp of last calculation

ALTER TABLE leads ADD COLUMN IF NOT EXISTS score integer DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_categoria text DEFAULT NULL
  CHECK (score_categoria IN ('frio', 'tibio', 'caliente'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_justificacion text DEFAULT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_updated_at timestamptz DEFAULT NULL;
