/**
 * onboardingService — Gerencia o estado do fluxo de onboarding
 *
 * Arquivo no disco: AppData/Roaming/Yokanri/onboarding.json
 * {
 *   "completed": false,
 *   "language": "pt-BR",
 *   "isSupporter": false,
 *   "supporterCode": null,
 *   "completedAt": null,
 *   "appVersion": "1.0.0"
 * }
 *
 * Lógica de detecção (isNeeded):
 *   - Arquivo não existe → primeiro uso → true
 *   - completed: false → em andamento → true
 *   - completed: true mas sem workspaces → dados corrompidos/deletados → true
 *   - completed: true e workspaces existem → false
 */

import { readFile, writeFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getAppDir, getWorkspacesRoot } from '../../services/workspace/workspacePaths';

const FILE_NAME = 'onboarding.json';
const APP_VERSION = '1.0.0';

// ─── Helpers de leitura/escrita ──────────────────────────

async function getOnboardingPath() {
  const appDir = await getAppDir();
  return await join(appDir, FILE_NAME);
}

async function readState() {
  try {
    const path = await getOnboardingPath();
    const fileExists = await exists(path);
    if (!fileExists) return null;

    const content = await readFile(path);
    return JSON.parse(new TextDecoder().decode(content));
  } catch {
    return null;
  }
}

async function writeState(state) {
  const appDir = await getAppDir();
  await mkdir(appDir, { recursive: true });
  const path = await getOnboardingPath();
  const content = new TextEncoder().encode(JSON.stringify(state, null, 2));
  await writeFile(path, content);
}

// ─── Lê o registry de workspaces sem inicializar nada ────

async function hasAnyWorkspace() {
  try {
    const root = await getWorkspacesRoot();
    const registryPath = await join(root, '..', 'workspaces.json');
    const fileExists = await exists(registryPath);
    if (!fileExists) return false;

    const content = await readFile(registryPath);
    const registry = JSON.parse(new TextDecoder().decode(content));
    return Array.isArray(registry.workspaces) && registry.workspaces.length > 0;
  } catch {
    return false;
  }
}

// ─── API pública ─────────────────────────────────────────

/**
 * Verifica se o onboarding é necessário.
 *
 * Retorna true se:
 * - onboarding.json não existe E não há workspaces (primeiro uso real)
 * - completed === false (onboarding interrompido)
 * - completed === true mas não há workspaces (dados deletados externamente)
 *
 * Caso especial de migração:
 * - onboarding.json não existe MAS há workspaces → usuário existente antes do
 *   sistema de onboarding. Marca como concluído automaticamente e retorna false.
 *
 * @returns {Promise<boolean>}
 */
export async function isNeeded() {
  try {
    const state = await readState();

    // Arquivo não existe → verificar se é primeiro uso ou migração
    if (!state) {
      const hasWorkspace = await hasAnyWorkspace();

      if (hasWorkspace) {
        // Usuário existente sem onboarding.json → migração silenciosa
        // Marca como concluído para não mostrar onboarding nas próximas execuções
        await writeState({
          completed: true,
          language: 'pt-BR',
          isSupporter: false,
          supporterCode: null,
          completedAt: new Date().toISOString(),
          appVersion: APP_VERSION,
          migratedAt: new Date().toISOString(),
        });
        return false;
      }

      // Nenhum workspace → primeiro uso real
      return true;
    }

    // Marcado como não concluído
    if (!state.completed) return true;

    // Concluído, mas sem workspaces (segurança)
    const hasWorkspace = await hasAnyWorkspace();
    if (!hasWorkspace) return true;

    return false;
  } catch {
    // Se qualquer leitura falhar, assume primeiro uso
    return true;
  }
}

/**
 * Lê o estado atual do onboarding (para restaurar sessão interrompida).
 * @returns {Promise<Object|null>}
 */
export async function getState() {
  return await readState();
}

/**
 * Salva preferência de idioma durante o onboarding.
 * @param {string} language - Código do idioma ('pt-BR', 'en', 'es', 'ja')
 */
export async function saveLanguage(language) {
  try { localStorage.setItem('yokanri-language', language); } catch {}
  const current = (await readState()) || {};
  await writeState({ ...current, language });
}

/**
 * Ativa o modo supporter com um código validado.
 * @param {string} code
 */
export async function activateSupporter(code) {
  const current = (await readState()) || {};
  await writeState({ ...current, isSupporter: true, supporterCode: code });
}

/**
 * Marca o onboarding como concluído.
 * Deve ser chamado APÓS o workspace ser criado/importado com sucesso.
 *
 * @param {Object} opts
 * @param {string} opts.language
 * @param {boolean} [opts.isSupporter]
 * @param {string|null} [opts.supporterCode]
 */
export async function markCompleted({ language, isSupporter = false, supporterCode = null } = {}) {
  const current = (await readState()) || {};
  await writeState({
    ...current,
    completed: true,
    language: language || current.language || 'pt-BR',
    isSupporter: isSupporter || current.isSupporter || false,
    supporterCode: supporterCode || current.supporterCode || null,
    completedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
  });
}

/**
 * Reinicia o onboarding (para fins de debug ou reset manual).
 * O workspace existente NÃO é deletado.
 */
export async function reset() {
  await writeState({
    completed: false,
    language: 'pt-BR',
    isSupporter: false,
    supporterCode: null,
    completedAt: null,
    appVersion: APP_VERSION,
  });
}
