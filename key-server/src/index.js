/**
 * Yokanri Key Server — Cloudflare Worker
 *
 * Endpoints públicos:
 *   POST /activate  { key, machine_id, machine_name? }
 *   POST /validate  { key, machine_id }
 *
 * Endpoints admin (header: Authorization: Bearer <ADMIN_SECRET>):
 *   POST /admin/generate { count?, email?, tier?, source? }
 *   POST /admin/revoke   { key }
 *   GET  /admin/keys
 *
 * Regras:
 *   - 1 máquina ativa por key; nova ativação derruba a anterior
 *   - Rate limit: MAX_ACTIVATIONS_30D ativações por key a cada 30 dias
 *   - Key revogada nunca ativa/valida
 */

const MAX_ACTIVATIONS_30D = 5;

// ─── Helpers ────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function badRequest(msg)   { return json({ ok: false, error: msg }, 400); }
function unauthorized()    { return json({ ok: false, error: 'unauthorized' }, 401); }
function notFound()        { return json({ ok: false, error: 'not_found' }, 404); }

// Gera key no formato YKNR-XXXX-XXXX-XXXX (sem caracteres ambíguos 0/O/1/I)
function generateKey() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    return [...bytes].map(b => alphabet[b % alphabet.length]).join('');
  };
  return `YKNR-${block()}-${block()}-${block()}`;
}

function normalizeKey(raw) {
  return String(raw || '').trim().toUpperCase();
}

function isValidKeyFormat(key) {
  return /^YKNR-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key);
}

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  return env.ADMIN_SECRET && auth === `Bearer ${env.ADMIN_SECRET}`;
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleActivate(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest('invalid_json');

  const key = normalizeKey(body.key);
  const machineId   = String(body.machine_id || '').trim();
  const machineName = String(body.machine_name || '').slice(0, 64);

  if (!isValidKeyFormat(key)) return badRequest('invalid_key_format');
  if (!machineId)             return badRequest('missing_machine_id');

  const keyRow = await env.DB
    .prepare('SELECT key_code, tier, revoked FROM keys WHERE key_code = ?')
    .bind(key).first();

  if (!keyRow)         return json({ ok: false, error: 'key_not_found' }, 404);
  if (keyRow.revoked)  return json({ ok: false, error: 'key_revoked' }, 403);

  // Máquina atual já é a ativa? Só atualiza last_seen (não conta no rate limit)
  const current = await env.DB
    .prepare('SELECT machine_id FROM activations WHERE key_code = ?')
    .bind(key).first();

  if (current && current.machine_id === machineId) {
    await env.DB
      .prepare("UPDATE activations SET last_seen = datetime('now'), machine_name = ? WHERE key_code = ?")
      .bind(machineName, key).run();
    return json({ ok: true, tier: keyRow.tier, already_active: true });
  }

  // Rate limit: N ativações (troca de máquina) por 30 dias
  const { cnt } = await env.DB
    .prepare(`SELECT COUNT(*) AS cnt FROM events
              WHERE key_code = ? AND action = 'activate'
                AND created_at > datetime('now', '-30 days')`)
    .bind(key).first();

  if (cnt >= MAX_ACTIVATIONS_30D) {
    return json({ ok: false, error: 'too_many_activations', retry_days: 30 }, 429);
  }

  // Ativa nesta máquina (derruba a anterior automaticamente)
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO activations (key_code, machine_id, machine_name)
                    VALUES (?, ?, ?)
                    ON CONFLICT(key_code) DO UPDATE SET
                      machine_id = excluded.machine_id,
                      machine_name = excluded.machine_name,
                      activated_at = datetime('now'),
                      last_seen = datetime('now')`)
      .bind(key, machineId, machineName),
    env.DB.prepare(`INSERT INTO events (key_code, machine_id, action) VALUES (?, ?, 'activate')`)
      .bind(key, machineId),
  ]);

  return json({ ok: true, tier: keyRow.tier });
}

async function handleValidate(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return badRequest('invalid_json');

  const key = normalizeKey(body.key);
  const machineId = String(body.machine_id || '').trim();

  if (!isValidKeyFormat(key) || !machineId) return badRequest('invalid_params');

  const row = await env.DB
    .prepare(`SELECT k.tier, k.revoked, a.machine_id
              FROM keys k LEFT JOIN activations a ON a.key_code = k.key_code
              WHERE k.key_code = ?`)
    .bind(key).first();

  if (!row)                          return json({ ok: false, error: 'key_not_found' }, 404);
  if (row.revoked)                   return json({ ok: false, error: 'key_revoked' }, 403);
  if (row.machine_id !== machineId)  return json({ ok: false, error: 'other_machine' }, 409);

  await env.DB
    .prepare("UPDATE activations SET last_seen = datetime('now') WHERE key_code = ?")
    .bind(key).run();

  return json({ ok: true, tier: row.tier });
}

async function handleAdminGenerate(request, env) {
  const body = await request.json().catch(() => ({}));
  const count  = Math.min(Math.max(parseInt(body.count) || 1, 1), 50);
  const email  = body.email  || null;
  const tier   = body.tier   || 'supporter';
  const source = body.source || 'manual';

  const generated = [];
  for (let i = 0; i < count; i++) {
    const key = generateKey();
    await env.DB
      .prepare('INSERT INTO keys (key_code, email, source, tier) VALUES (?, ?, ?, ?)')
      .bind(key, email, source, tier).run();
    await env.DB
      .prepare("INSERT INTO events (key_code, action) VALUES (?, 'generate')")
      .bind(key).run();
    generated.push(key);
  }
  return json({ ok: true, keys: generated });
}

async function handleAdminRevoke(request, env) {
  const body = await request.json().catch(() => null);
  const key = normalizeKey(body?.key);
  if (!isValidKeyFormat(key)) return badRequest('invalid_key_format');

  const result = await env.DB
    .prepare('UPDATE keys SET revoked = 1 WHERE key_code = ?')
    .bind(key).run();

  if (!result.meta.changes) return notFound();

  await env.DB
    .prepare("INSERT INTO events (key_code, action) VALUES (?, 'revoke')")
    .bind(key).run();

  return json({ ok: true });
}

async function handleAdminList(env) {
  const { results } = await env.DB
    .prepare(`SELECT k.key_code, k.email, k.source, k.tier, k.revoked, k.created_at,
                     a.machine_name, a.activated_at, a.last_seen
              FROM keys k LEFT JOIN activations a ON a.key_code = k.key_code
              ORDER BY k.created_at DESC LIMIT 500`)
    .all();
  return json({ ok: true, keys: results });
}

// ─── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return json({}, 204);

    // Públicos
    if (request.method === 'POST' && path === '/activate') return handleActivate(request, env);
    if (request.method === 'POST' && path === '/validate') return handleValidate(request, env);

    // Admin
    if (path.startsWith('/admin/')) {
      if (!isAdmin(request, env)) return unauthorized();
      if (request.method === 'POST' && path === '/admin/generate') return handleAdminGenerate(request, env);
      if (request.method === 'POST' && path === '/admin/revoke')   return handleAdminRevoke(request, env);
      if (request.method === 'GET'  && path === '/admin/keys')     return handleAdminList(env);
    }

    return notFound();
  },
};
