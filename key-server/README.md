# Yokanri Key Server

Backend de ativação de keys (Cloudflare Workers + D1).

## Deploy (primeira vez)

```bash
# 1. Instalar o CLI da Cloudflare e logar
npm i -g wrangler
wrangler login

# 2. Criar o banco D1 (dentro desta pasta key-server/)
wrangler d1 create yokanri-keys
#    → copie o database_id exibido e cole no wrangler.toml

# 3. Aplicar o schema
wrangler d1 execute yokanri-keys --remote --file=schema.sql

# 4. Definir o segredo de admin (invente uma senha longa e guarde)
wrangler secret put ADMIN_SECRET

# 5. Publicar
wrangler deploy
#    → anote a URL: https://yokanri-key-server.<sua-conta>.workers.dev
```

Depois do deploy, atualize `YOKANRI_API_URL` em
`src/services/supporterService.js` no app com a URL gerada.

## Gerar keys manualmente (Fase 1)

```bash
curl -X POST https://yokanri-key-server.<conta>.workers.dev/admin/generate \
  -H "Authorization: Bearer SEU_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"count": 1, "email": "apoiador@email.com", "source": "kofi"}'
# → { "ok": true, "keys": ["YKNR-XXXX-XXXX-XXXX"] }
```

## Revogar key (chargeback)

```bash
curl -X POST .../admin/revoke \
  -H "Authorization: Bearer SEU_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"key": "YKNR-XXXX-XXXX-XXXX"}'
```

## Listar keys e ativações

```bash
curl .../admin/keys -H "Authorization: Bearer SEU_ADMIN_SECRET"
```

## Testar localmente

```bash
wrangler d1 execute yokanri-keys --local --file=schema.sql
wrangler dev
# API local em http://localhost:8787
```

## Regras implementadas

- 1 máquina ativa por key; nova ativação **derruba a anterior** automaticamente
- Rate limit: **5 ativações por key a cada 30 dias** (reativar a mesma máquina não conta)
- Key revogada → nunca ativa nem valida
- Formato da key: `YKNR-XXXX-XXXX-XXXX` (alfabeto sem 0/O/1/I)
