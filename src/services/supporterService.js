/**
 * supporterService — Ativação e validação da key de supporter
 *
 * Arquivo no disco: AppData/Roaming/Yokanri/supporter.json
 * {
 *   "key": "YKNR-XXXX-XXXX-XXXX",
 *   "machineId": "abc123...",
 *   "tier": "supporter",
 *   "activatedAt": "2026-07-08T12:00:00Z",
 *   "lastValidated": "2026-07-08T12:00:00Z"
 * }
 *
 * Regras (ver docs/PLANO-SISTEMA-KEY.md):
 *   - Grace offline de 14 dias: sem internet o status supporter continua
 *     válido por GRACE_DAYS desde lastValidated
 *   - Revalidação silenciosa: se lastValidated > REVALIDATE_DAYS, tenta
 *     /validate em background; falha de REDE é ignorada (grace cobre),
 *     resposta negativa do servidor (revogada/outra máquina) remove o registro
 *   - Nunca bloqueia dados do usuário — só controla benefícios
 */

import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';
import { readFile, writeFile, exists, mkdir, remove } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getAppDir } from './workspace/workspacePaths';

// Atualize após o deploy do key-server (ver key-server/README.md)
const YOKANRI_API_URL = 'https://yokanri-key-server.SEU-SUBDOMINIO.workers.dev';

const FILE_NAME        = 'supporter.json';
const GRACE_DAYS       = 14;
const REVALIDATE_DAYS  = 3;

// ─── Arquivo local ───────────────────────────────────────

async function getFilePath() {
  const appDir = await getAppDir();
  return await join(appDir, FILE_NAME);
}

export async function loadActivation() {
  try {
    const path = await getFilePath();
    if (!(await exists(path))) return null;
    const content = await readFile(path);
    return JSON.parse(new TextDecoder().decode(content));
  } catch {
    return null;
  }
}

async function saveActivation(data) {
  const appDir = await getAppDir();
  await mkdir(appDir, { recursive: true });
  const path = await getFilePath();
  await writeFile(path, new TextEncoder().encode(JSON.stringify(data, null, 2)));
}

async function removeActivation() {
  try {
    const path = await getFilePath();
    if (await exists(path)) await remove(path);
  } catch {
    // arquivo inacessível — o grace period expira sozinho
  }
}

// ─── Machine ID ──────────────────────────────────────────

export async function getMachineId() {
  return await invoke('get_machine_id');
}

function getMachineName() {
  try {
    // hostname não é exposto ao WebView; usa plataforma como aproximação
    return navigator.userAgentData?.platform || navigator.platform || 'unknown';
  } catch {
    return 'unknown';
  }
}

// ─── API ─────────────────────────────────────────────────

async function apiPost(path, body) {
  const res = await fetch(`${YOKANRI_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    connectTimeout: 10_000,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ...data };
}

/**
 * Ativa uma key nesta máquina.
 * @returns {{ ok: true, tier: string } | { ok: false, error: string }}
 *   error: invalid_key_format | key_not_found | key_revoked |
 *          too_many_activations | network
 */
export async function activateKey(rawKey) {
  const key = String(rawKey || '').trim().toUpperCase();
  if (!/^YKNR-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key)) {
    return { ok: false, error: 'invalid_key_format' };
  }

  let machineId;
  try {
    machineId = await getMachineId();
  } catch {
    return { ok: false, error: 'machine_id_failed' };
  }

  let result;
  try {
    result = await apiPost('/activate', {
      key,
      machine_id: machineId,
      machine_name: getMachineName(),
    });
  } catch {
    return { ok: false, error: 'network' };
  }

  if (!result.ok) {
    return { ok: false, error: result.error || 'unknown' };
  }

  const now = new Date().toISOString();
  await saveActivation({
    key,
    machineId,
    tier: result.tier || 'supporter',
    activatedAt: now,
    lastValidated: now,
  });

  return { ok: true, tier: result.tier || 'supporter' };
}

/** Remove a ativação local (a key continua válida para usar em outra máquina). */
export async function deactivateLocal() {
  await removeActivation();
}

// ─── Status + revalidação silenciosa ─────────────────────

function daysSince(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / 86_400_000;
}

/**
 * Status atual do supporter, revalidando em background se necessário.
 * Chamar no boot do app. Nunca lança.
 *
 * @returns {{ active: boolean, tier?: string, key?: string, graceExpired?: boolean }}
 */
export async function getSupporterStatus() {
  const activation = await loadActivation();
  if (!activation?.key || !activation?.machineId) return { active: false };

  const sinceValidated = daysSince(activation.lastValidated);

  // Dentro da janela de revalidação — nem tenta rede
  if (sinceValidated < REVALIDATE_DAYS) {
    return { active: true, tier: activation.tier, key: activation.key };
  }

  // Tenta revalidar silenciosamente
  try {
    const result = await apiPost('/validate', {
      key: activation.key,
      machine_id: activation.machineId,
    });

    if (result.ok) {
      await saveActivation({ ...activation, lastValidated: new Date().toISOString() });
      return { active: true, tier: result.tier || activation.tier, key: activation.key };
    }

    // Resposta explícita do servidor: revogada, não existe ou outra máquina ativou
    if (['key_revoked', 'key_not_found', 'other_machine'].includes(result.error)) {
      await removeActivation();
      return { active: false, reason: result.error };
    }
  } catch {
    // Sem rede — cai no grace period abaixo
  }

  // Falha de rede (ou erro inesperado): vale o grace period
  if (sinceValidated <= GRACE_DAYS) {
    return { active: true, tier: activation.tier, key: activation.key };
  }
  return { active: false, graceExpired: true, key: activation.key };
}

/** Mascara a key para exibição: YKNR-••••-••••-A1B2 */
export function maskKey(key) {
  if (!key || key.length < 4) return '';
  return `YKNR-••••-••••-${key.slice(-4)}`;
}
