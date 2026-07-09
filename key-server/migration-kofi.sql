-- Fase 3 — Ko-fi: idempotência por transação externa
-- Aplicar com: wrangler d1 execute yokanri-keys --remote --file=migration-kofi.sql

-- Guarda o id da transação do Ko-fi/Patreon para não gerar key duplicada
-- caso o webhook seja reenviado.
ALTER TABLE keys ADD COLUMN external_id TEXT;

-- Índice único parcial: impede duas keys para a mesma transação,
-- mas permite várias keys sem external_id (geração manual/admin).
CREATE UNIQUE INDEX IF NOT EXISTS idx_keys_external
  ON keys (external_id) WHERE external_id IS NOT NULL;
