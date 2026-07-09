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

function html(body) {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

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

// ─── Painel Admin (HTML) ─────────────────────────────────────────────────────

const ADMIN_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yokanri · Admin de Keys</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    background: radial-gradient(120% 90% at 50% -10%, #15131d 0%, #0c0c10 55%, #0a0a0d 100%);
    color: #f5f5f7;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .mono { font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace; }
  .center { max-width: 380px; margin: 14vh auto 0; }
  .card { background: #101015; border: 1px solid #22222c; border-radius: 16px; padding: 26px; }
  h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: -0.4px; }
  h2 { font-size: 15px; margin: 0 0 14px; font-weight: 600; color: #e5e5ea; }
  .logo {
    width: 46px; height: 46px; border-radius: 13px; margin: 0 auto 16px;
    background: linear-gradient(145deg, #2dd4bf, #7c5cff);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 19px; letter-spacing: -1px;
  }
  .sub { color: #85859a; font-size: 13px; margin: 0 0 20px; }
  input, select {
    width: 100%; height: 38px; padding: 0 12px; margin-bottom: 10px;
    background: #16161c; border: 1px solid #2c2c38; border-radius: 9px;
    color: #f5f5f7; font-size: 14px; outline: none;
  }
  input:focus, select:focus { border-color: rgba(45,212,191,0.5); }
  button {
    height: 38px; padding: 0 16px; border-radius: 9px; border: none; cursor: pointer;
    background: linear-gradient(90deg, #2dd4bf, #7c5cff); color: #fff;
    font-size: 14px; font-weight: 600; transition: opacity 0.15s;
  }
  button:hover { opacity: 0.9; }
  button.ghost { background: none; border: 1px solid #2c2c38; color: #a4a4ad; }
  button.mini { height: 24px; padding: 0 9px; font-size: 11px; font-weight: 500; border-radius: 6px; background: rgba(255,255,255,0.06); color: #cfcfe0; margin-left: 6px; }
  button.mini.danger { background: rgba(252,165,165,0.1); color: #fca5a5; }
  .err { color: #fca5a5; font-size: 13px; margin-top: 8px; min-height: 18px; }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 20px 60px; }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; }
  .brand .logo { width: 30px; height: 30px; border-radius: 9px; font-size: 13px; margin: 0; }
  section.card { margin-bottom: 18px; }
  .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
  .row label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #85859a; }
  .row label input, .row label select { margin-bottom: 0; }
  .row .c-count { width: 90px; }
  .row .c-email { min-width: 220px; }
  #genResult { margin-top: 14px; font-size: 13px; color: #85859a; }
  #genResult code { background: rgba(45,212,191,0.1); color: #4be3d0; padding: 3px 8px; border-radius: 6px; }
  .list-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .list-head h2 { margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: #6e6e78; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; border-bottom: 1px solid #22222c; }
  td { padding: 9px 10px; border-bottom: 1px solid #1a1a22; vertical-align: middle; }
  .dim { color: #6e6e78; }
  .pill { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .pill.ok { background: rgba(110,231,183,0.12); color: #6ee7b7; }
  .pill.danger { background: rgba(252,165,165,0.12); color: #fca5a5; }
  .pill.dim { background: rgba(255,255,255,0.05); color: #85859a; }
</style>
</head>
<body>

<div id="login" class="center">
  <div class="card">
    <div class="logo">Yo</div>
    <h1>Painel de Keys</h1>
    <p class="sub">Digite o ADMIN_SECRET para acessar.</p>
    <input id="secret" type="password" placeholder="ADMIN_SECRET" autocomplete="off" />
    <button id="loginBtn" style="width:100%">Entrar</button>
    <div id="loginErr" class="err"></div>
  </div>
</div>

<div id="app" class="wrap" style="display:none">
  <header>
    <div class="brand"><div class="logo">Yo</div> Yokanri · Keys</div>
    <button id="logout" class="ghost">Sair</button>
  </header>

  <section class="card">
    <h2>Gerar keys</h2>
    <div class="row">
      <label>Quantidade <input id="genCount" class="c-count" type="number" value="1" min="1" max="50"></label>
      <label>Email (opcional) <input id="genEmail" class="c-email" type="email" placeholder="apoiador@email.com"></label>
      <label>Origem
        <select id="genSource">
          <option value="manual">manual</option>
          <option value="kofi">kofi</option>
          <option value="patreon">patreon</option>
        </select>
      </label>
      <button id="genBtn">Gerar</button>
    </div>
    <div id="genResult"></div>
  </section>

  <section class="card">
    <div class="list-head">
      <h2>Keys (<span id="count">0</span>)</h2>
      <button id="refresh" class="ghost">Atualizar</button>
    </div>
    <table>
      <thead><tr>
        <th>Key</th><th>Email</th><th>Origem</th><th>Status</th><th>Máquina</th><th>Última validação</th><th></th>
      </tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </section>
</div>

<script>
  var SECRET = sessionStorage.getItem('yk_secret') || '';

  function hdrs() { return { 'Authorization': 'Bearer ' + SECRET, 'Content-Type': 'application/json' }; }
  function show(id, on) { document.getElementById(id).style.display = on ? '' : 'none'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }

  async function tryAuth(secret) {
    var res = await fetch('/admin/keys', { headers: { 'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/json' } });
    if (res.status === 200) {
      SECRET = secret;
      sessionStorage.setItem('yk_secret', SECRET);
      show('login', false); show('app', true);
      render(await res.json());
      return true;
    }
    return false;
  }

  async function login() {
    var ok = await tryAuth(document.getElementById('secret').value.trim());
    if (!ok) document.getElementById('loginErr').textContent = 'Senha incorreta.';
  }

  function logout() {
    SECRET = ''; sessionStorage.removeItem('yk_secret');
    show('app', false); show('login', true);
    document.getElementById('secret').value = '';
  }

  async function refresh() {
    var res = await fetch('/admin/keys', { headers: hdrs() });
    if (res.status !== 200) return logout();
    render(await res.json());
  }

  function statusCell(r) {
    if (r.revoked) return '<span class="pill danger">Revogada</span>';
    if (r.activated_at) return '<span class="pill ok">Ativa</span>';
    return '<span class="pill dim">Não ativada</span>';
  }

  function render(data) {
    var keys = data.keys || [];
    document.getElementById('count').textContent = keys.length;
    var rows = keys.map(function(r) {
      var revokeBtn = r.revoked ? '' : '<button class="mini danger" onclick="revoke(\\'' + esc(r.key_code) + '\\')">revogar</button>';
      return '<tr>' +
        '<td class="mono">' + esc(r.key_code) + '<button class="mini" onclick="copyKey(\\'' + esc(r.key_code) + '\\')">copiar</button></td>' +
        '<td>' + esc(r.email || '—') + '</td>' +
        '<td>' + esc(r.source) + '</td>' +
        '<td>' + statusCell(r) + '</td>' +
        '<td class="dim">' + esc(r.machine_name || '—') + '</td>' +
        '<td class="dim mono">' + esc((r.last_seen || '').slice(0, 16)) + '</td>' +
        '<td style="text-align:right">' + revokeBtn + '</td>' +
      '</tr>';
    }).join('');
    document.getElementById('rows').innerHTML = rows || '<tr><td colspan="7" class="dim">Nenhuma key ainda.</td></tr>';
  }

  async function generate() {
    var body = {
      count: parseInt(document.getElementById('genCount').value) || 1,
      email: document.getElementById('genEmail').value.trim() || null,
      source: document.getElementById('genSource').value
    };
    var res = await fetch('/admin/generate', { method: 'POST', headers: hdrs(), body: JSON.stringify(body) });
    var data = await res.json();
    if (data.ok) {
      document.getElementById('genResult').innerHTML = 'Geradas: ' + data.keys.map(function(k) {
        return '<code class="mono">' + esc(k) + '</code>';
      }).join(' ');
      document.getElementById('genEmail').value = '';
      refresh();
    } else {
      document.getElementById('genResult').textContent = 'Erro: ' + (data.error || 'desconhecido');
    }
  }

  async function revoke(key) {
    if (!confirm('Revogar ' + key + '?\\nIsso desativa a key imediatamente.')) return;
    await fetch('/admin/revoke', { method: 'POST', headers: hdrs(), body: JSON.stringify({ key: key }) });
    refresh();
  }

  function copyKey(k) {
    navigator.clipboard.writeText(k);
  }

  document.getElementById('loginBtn').onclick = login;
  document.getElementById('secret').addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });
  document.getElementById('logout').onclick = logout;
  document.getElementById('refresh').onclick = refresh;
  document.getElementById('genBtn').onclick = generate;

  if (SECRET) tryAuth(SECRET);
</script>
</body>
</html>`;

// ─── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return json({}, 204);

    // Públicos
    if (request.method === 'POST' && path === '/activate') return handleActivate(request, env);
    if (request.method === 'POST' && path === '/validate') return handleValidate(request, env);

    // Painel admin (HTML) — a página é pública; os dados exigem o ADMIN_SECRET
    if (request.method === 'GET' && path === '/admin') return html(ADMIN_HTML);

    // Admin (API)
    if (path.startsWith('/admin/')) {
      if (!isAdmin(request, env)) return unauthorized();
      if (request.method === 'POST' && path === '/admin/generate') return handleAdminGenerate(request, env);
      if (request.method === 'POST' && path === '/admin/revoke')   return handleAdminRevoke(request, env);
      if (request.method === 'GET'  && path === '/admin/keys')     return handleAdminList(env);
    }

    return notFound();
  },
};
