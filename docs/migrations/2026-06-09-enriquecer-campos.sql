-- Migration: Enriquecer datos del campo
-- Adds CONEAT index, caracteristicas text[] for flexible infrastructure/accessibility data,
-- and 'turistica' as a new tipo option.

-- CONEAT soil productivity index (numeric, optional)
ALTER TABLE campos ADD COLUMN IF NOT EXISTS coneat numeric(6,2) DEFAULT NULL;

-- Flexible characteristics array — stores any combination of features:
-- predefined (Vivienda, Galpón, Corrales, ...) or free-text custom items
ALTER TABLE campos ADD COLUMN IF NOT EXISTS caracteristicas text[] NOT NULL DEFAULT '{}';

-- Add 'turistica' to tipo options
-- If tipo uses a CHECK constraint (most common in Supabase):
ALTER TABLE campos DROP CONSTRAINT IF EXISTS campos_tipo_check;
ALTER TABLE campos ADD CONSTRAINT campos_tipo_check
  CHECK (tipo IS NULL OR tipo IN ('ganadero', 'agricola', 'forestal', 'mixto', 'turistica'));

-- If tipo is a PostgreSQL enum type instead, run this:
-- DO $$ BEGIN
--   ALTER TYPE tipo_campo ADD VALUE IF NOT EXISTS 'turistica';
-- EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index for array containment queries (e.g. filter by 'Energía eléctrica')
CREATE INDEX IF NOT EXISTS campos_caracteristicas_gin ON campos USING GIN (caracteristicas);
