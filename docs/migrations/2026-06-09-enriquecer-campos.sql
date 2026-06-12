-- Migration: Enriquecer datos del campo
-- Adds CONEAT index, infrastructure checkboxes, accessibility fields
-- and 'turistica' as a new tipo option

-- CONEAT soil productivity index
ALTER TABLE campos ADD COLUMN IF NOT EXISTS coneat numeric(6,2) DEFAULT NULL;

-- Infrastructure boolean flags
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_vivienda boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_galpon boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_corrales boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_energia_electrica boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_riego boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS infra_caminos_internos boolean NOT NULL DEFAULT false;

-- Additional accessibility points (acceso_ruta already exists)
ALTER TABLE campos ADD COLUMN IF NOT EXISTS acceso_puerto boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS acceso_frigorifico boolean NOT NULL DEFAULT false;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS acceso_planta boolean NOT NULL DEFAULT false;

-- Add 'turistica' to tipo options
-- If tipo uses a CHECK constraint (most common in Supabase):
ALTER TABLE campos DROP CONSTRAINT IF EXISTS campos_tipo_check;
ALTER TABLE campos ADD CONSTRAINT campos_tipo_check
  CHECK (tipo IS NULL OR tipo IN ('ganadero', 'agricola', 'forestal', 'mixto', 'turistica'));

-- If tipo is a PostgreSQL enum type instead, run this:
-- DO $$ BEGIN
--   ALTER TYPE tipo_campo ADD VALUE IF NOT EXISTS 'turistica';
-- EXCEPTION WHEN duplicate_object THEN NULL; END $$;
