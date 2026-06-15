-- docs/migrations/2026-06-14-infraestructura-digital.sql

-- ===== 1. Campos públicos del escritorio (página pública + branding) =====

ALTER TABLE escritorios
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS metricas_publicas BOOLEAN NOT NULL DEFAULT false;

-- Índice único parcial (permite múltiples NULL hasta que cada escritorio configure su slug)
CREATE UNIQUE INDEX IF NOT EXISTS idx_escritorios_slug
  ON escritorios(slug) WHERE slug IS NOT NULL;

-- ===== 2. Origen del lead (para analytics) =====

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS origen TEXT
  CHECK (origen IN ('pagina_publica', 'buscador', 'directo', 'manual'));

CREATE INDEX IF NOT EXISTS idx_leads_origen ON leads(escritorio_id, origen);

-- ===== 3. Ciclo de vida del campo (para tiempos de venta) =====

ALTER TABLE campos
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vendido_at TIMESTAMPTZ;

-- Backfill: para todos los campos publicados existentes, asumimos created_at como published_at
UPDATE campos
SET published_at = created_at
WHERE estado = 'publicado' AND published_at IS NULL;

-- Para campos en estado vendido (si ya existían), asumimos updated_at como vendido_at
UPDATE campos
SET vendido_at = updated_at
WHERE estado = 'vendido' AND vendido_at IS NULL;

-- ===== 4. Referrer de visitas (para clasificar origen de leads) =====

ALTER TABLE visitas
  ADD COLUMN IF NOT EXISTS referrer_path TEXT;
