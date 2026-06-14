-- Agrega un token UUID único por campo para el portal del propietario.
-- El DEFAULT gen_random_uuid() asigna token a todos los campos existentes automáticamente.
ALTER TABLE campos
  ADD COLUMN IF NOT EXISTS propietario_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Índice único para lookup eficiente por token
CREATE UNIQUE INDEX IF NOT EXISTS idx_campos_propietario_token
  ON campos(propietario_token);
