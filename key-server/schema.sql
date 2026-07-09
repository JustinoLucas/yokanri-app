-- Schema do banco de keys do Yokanri (Cloudflare D1)
-- Aplicar com: wrangler d1 execute yokanri-keys --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS keys (
  key_code   TEXT PRIMARY KEY,
  email      TEXT,
  source     TEXT NOT NULL DEFAULT 'manual',   -- manual | kofi | patreon
  tier       TEXT NOT NULL DEFAULT 'supporter',
  revoked    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Uma linha por key = máquina atualmente ativa
CREATE TABLE IF NOT EXISTS activations (
  key_code     TEXT PRIMARY KEY REFERENCES keys(key_code),
  machine_id   TEXT NOT NULL,
  machine_name TEXT,
  activated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Log de eventos (auditoria + rate limit de ativações)
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  key_code   TEXT NOT NULL,
  machine_id TEXT,
  action     TEXT NOT NULL,                    -- activate | validate_fail | revoke | generate
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_key_action
  ON events (key_code, action, created_at);
