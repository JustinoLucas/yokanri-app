# Sistema de Key — Plano de Implementação

Modelo de referência: Content Manager (Assetto Corsa).
Apoiador doa no Ko-fi/Patreon → recebe uma key → ativa no app → benefícios liberados.

## Fluxo geral

```
Apoiador doa no Ko-fi/Patreon
        ↓
Backend recebe webhook → gera key única (YKNR-XXXX-XXXX-XXXX)
        ↓
Key enviada por email automático
        ↓
Usuário cola a key no app (Configurações → Apoiar)
        ↓
App envia key + machine_id ao backend → backend valida e ata a key à máquina
        ↓
App salva registro de ativação local → benefícios liberados
        ↓
Trocou de PC/formatou? → ativa na máquina nova → a antiga é desativada automaticamente
```

## Regras de negócio

1. **1 máquina ativa por key por vez.**
2. **Ativação nova derruba a antiga automaticamente** — sem erro de "key em uso",
   sem burocracia de desativar antes. A máquina mais recente ganha (igual ao CM).
   Evita a maioria dos tickets de suporte de quem formatou.
3. **Limite de trocas: 5 ativações por 30 dias por key** — impede compartilhamento
   em massa sem incomodar usuário legítimo que formatou ou trocou de PC.
4. **Grace period offline de 14 dias** — o app é local-first; funciona offline nesse
   período e revalida silenciosamente quando tem internet. Passou de 14 dias sem
   validar: aviso amigável e os benefícios supporter voltam ao normal. Nada é
   bloqueado além disso.
5. **A key NUNCA bloqueia a biblioteca/dados do usuário** — só libera benefícios
   (temas custom, etc.). Espírito de doação, não DRM.
6. **Keys revogáveis** — chargeback no Ko-fi/Patreon → `revoked=1` no banco.
7. **Realismo anti-pirataria** — proteção client-side é sempre crackeável.
   O objetivo é o caminho honesto ser mais fácil que o desonesto.
   Sem ofuscação pesada, sem DRM agressivo.

## Arquitetura

| Peça             | Tecnologia                    | Custo               |
|------------------|-------------------------------|---------------------|
| API de ativação  | Cloudflare Workers            | Grátis (100k req/dia) |
| Banco de keys    | Cloudflare D1 (SQLite)        | Grátis              |
| Webhook Ko-fi    | Webhook nativo do Ko-fi       | Grátis              |
| Webhook Patreon  | Patreon API v2 (OAuth)        | Grátis              |
| Email com a key  | Resend.com                    | Grátis (100/dia)    |

Código do backend: pasta `key-server/` neste repositório.

## Banco de dados

```sql
keys        → key_code, email, source (kofi/patreon/manual), tier, revoked, created_at
activations → key_code (PK), machine_id, machine_name, activated_at, last_seen
events      → id, key_code, machine_id, action, created_at   (auditoria + rate limit)
```

## Endpoints

| Endpoint               | Auth          | Função |
|------------------------|---------------|--------|
| `POST /activate`       | pública       | `{key, machine_id, machine_name}` → valida, desativa máquina anterior, ativa a nova |
| `POST /validate`       | pública       | `{key, machine_id}` → check periódico silencioso |
| `POST /admin/generate` | ADMIN_SECRET  | Gera N keys (fase manual: você envia por email) |
| `POST /admin/revoke`   | ADMIN_SECRET  | Revoga uma key |
| `GET  /admin/keys`     | ADMIN_SECRET  | Lista keys + ativações |
| `POST /webhook/kofi`   | token Ko-fi   | (Fase 3) doação → key automática por email |
| `POST /webhook/patreon`| assinatura    | (Fase 4) idem Patreon |

## No app (Tauri)

- **Machine ID**: crate `machine-uid` no Rust — estável entre reboots.
  Muda ao formatar (ok, reativação é automática).
- **Ativação**: campo de key na página Supporter chama `/activate`.
- **Registro local**: `supporter.json` no diretório do app com
  `{key, machineId, tier, activatedAt, lastValidated}`.
- **Revalidação silenciosa**: no boot, se `lastValidated > 3 dias`, chama
  `/validate` em background. Falhou por rede? Ignora (grace de 14 dias).
  Key inválida/revogada/outra máquina? Remove o registro local.

## Fases

| Fase | Escopo | Status |
|------|--------|--------|
| 1 | Backend Workers + D1: schema, /activate, /validate, /admin/* — geração manual de keys | ⏳ |
| 2 | App: machine-id (Rust), tela de ativação, registro local, revalidação silenciosa | ⏳ |
| 3 | Webhook Ko-fi → key automática por email (Resend) | — |
| 4 | Webhook Patreon (OAuth, mais complexo) | — |
| 5 | Painel admin simples (listar/revogar) | — |

## Deploy do backend (você precisa fazer uma vez)

1. Criar conta gratuita em https://dash.cloudflare.com
2. `npm i -g wrangler && wrangler login`
3. Na pasta `key-server/`: seguir o README.md
