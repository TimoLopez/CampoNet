-- Migration: Add comision_pct and exclusividad to campos
-- These are internal fields for the escritorio — not exposed publicly.

ALTER TABLE campos ADD COLUMN IF NOT EXISTS comision_pct numeric(5,2) DEFAULT NULL;
ALTER TABLE campos ADD COLUMN IF NOT EXISTS exclusividad boolean NOT NULL DEFAULT false;
