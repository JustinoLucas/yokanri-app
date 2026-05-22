/**
 * WorkspaceManager — Gerencia workspaces/bibliotecas do Yokanri
 *
 * Responsabilidades:
 * - Registro central de workspaces (workspaces.json)
 * - Criar, listar, renomear, deletar workspaces
 * - Definir workspace ativo
 * - Inicializar o workspace padrão na primeira execução
 *
 * Estrutura no disco:
 *   AppData/Roaming/Yokanri/
 *   |-- workspaces.json              <- registro central
 *   +-- workspaces/
 *       +-- default/
 *           |-- data.db
 *           +-- covers/
 *
 * Custom location (workspace movido):
 *   D:/Backups/Yokanri/
 *   +-- Minha Biblioteca/
 *       |-- data.db
 *       +-- covers/
 *
 * Formato do workspaces.json:
 *   {
 *     "activeId": "abc123",
 *     "workspaces": [
 *       { "id": "abc123", "name": "Minha Biblioteca", "slug": "default", "createdAt": "...", "updatedAt": "..." },
 *       { "id": "def456", "name": "Backup", "slug": "backup", "path": "D:/Backups/Yokanri/Backup", ... }
 *     ]
 *   }
 */

import {
  readFile,
  writeFile,
  exists,
  mkdir,
  remove,
  readDir,
  rename,
} from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import {
  getAppDir,
  getOldAppDir,
  getWorkspacesRoot,
  getWorkspaceDir,
  setActiveWorkspace,
  FILES,
  DIRS,
} from './workspacePaths';

// ─── HELPERS ────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Converte um nome para slug seguro para filesystem
 * "Minha Biblioteca!" → "minha-biblioteca"
 */
function toSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')    // substitui caracteres especiais por -
    .replace(/^-|-$/g, '');          // remove - do início e fim
}

// ─── REGISTRO CENTRAL ───────────────────────────────────

async function getRegistryPath() {
  const appDir = await getAppDir();
  return await join(appDir, FILES.REGISTRY);
}

/**
 * Lê o registro central de workspaces
 * @returns {Promise<{activeId: string, workspaces: Array}>}
 */
async function readRegistry() {
  const path = await getRegistryPath();
  const fileExists = await exists(path);

  if (!fileExists) {
    return { activeId: null, workspaces: [] };
  }

  const content = await readFile(path);
  const text = new TextDecoder().decode(content);
  return JSON.parse(text);
}

/**
 * Salva o registro central de workspaces
 */
async function saveRegistry(registry) {
  const path = await getRegistryPath();
  const content = new TextEncoder().encode(JSON.stringify(registry, null, 2));
  await writeFile(path, content);
}

// ─── API PÚBLICA ────────────────────────────────────────

/**
 * Prepara apenas os diretórios raiz do app (sem criar workspace).
 *
 * Usado pelo onboarding ANTES de criar o primeiro workspace.
 * Idempotente — pode ser chamado múltiplas vezes sem efeito colateral.
 *
 * @returns {Promise<void>}
 */
export async function initDirsOnly() {
  await migrateAppDirectory();
  const root = await getWorkspacesRoot();
  await mkdir(root, { recursive: true });
}

/**
 * Inicializa o sistema de workspaces
 * - Migra de com.yokanri.app para Yokanri (se necessário)
 * - Ativa o último workspace usado
 * - Cria diretórios necessários
 *
 * Deve ser chamado UMA VEZ na inicialização do app,
 * APÓS o onboarding ter criado o primeiro workspace.
 *
 * @returns {Promise<Object>} O workspace ativo
 */
export async function init() {
  // Migra diretório antigo (com.yokanri.app → Yokanri)
  await migrateAppDirectory();

  // Garante que a pasta raiz de workspaces existe
  const root = await getWorkspacesRoot();
  await mkdir(root, { recursive: true });

  const registry = await readRegistry();

  // Sem workspaces → onboarding não foi concluído corretamente
  if (registry.workspaces.length === 0) {
    throw new Error('Nenhum workspace encontrado. O onboarding não foi concluído.');
  }

  // Define o workspace ativo
  let active = registry.workspaces.find(ws => ws.id === registry.activeId);
  if (!active) {
    // Fallback: usa o primeiro workspace
    active = registry.workspaces[0];
    registry.activeId = active.id;
    await saveRegistry(registry);
  }

  // Configura o path system para usar o workspace ativo
  setActiveWorkspace(active.slug, active.path || null);

  // Garante que os diretórios do workspace ativo existem
  await ensureWorkspaceDirectories(active.slug, active.path);

  return active;
}

/**
 * Cria um novo workspace
 * @param {string} name - Nome do workspace (ex: "Romance")
 * @param {string} [customSlug] - Slug customizado (opcional)
 * @returns {Promise<Object>} O workspace criado
 */
export async function createWorkspace(name, customSlug) {
  const registry = await readRegistry();

  // Gera slug único
  let slug = customSlug || toSlug(name);
  const existingSlugs = registry.workspaces.map(ws => ws.slug);
  if (existingSlugs.includes(slug)) {
    let counter = 2;
    while (existingSlugs.includes(`${slug}-${counter}`)) counter++;
    slug = `${slug}-${counter}`;
  }

  const now = new Date().toISOString();
  const workspace = {
    id: generateId(),
    name: name.trim(),
    slug,
    createdAt: now,
    updatedAt: now,
  };

  // Cria os diretórios do workspace
  await ensureWorkspaceDirectories(slug);

  // Adiciona ao registro
  registry.workspaces.push(workspace);

  // Se é o primeiro workspace, define como ativo
  if (registry.workspaces.length === 1) {
    registry.activeId = workspace.id;
  }

  await saveRegistry(registry);
  return workspace;
}

/**
 * Lista todos os workspaces
 * @returns {Promise<Array>} Lista de workspaces
 */
export async function listWorkspaces() {
  const registry = await readRegistry();
  return registry.workspaces;
}

/**
 * Retorna o workspace ativo
 * @returns {Promise<Object|null>}
 */
export async function getActiveWorkspace() {
  const registry = await readRegistry();
  return registry.workspaces.find(ws => ws.id === registry.activeId) || null;
}

/**
 * Troca o workspace ativo
 * @param {string} workspaceId - ID do workspace para ativar
 * @returns {Promise<Object>} O workspace ativado
 */
export async function switchWorkspace(workspaceId) {
  const registry = await readRegistry();
  const workspace = registry.workspaces.find(ws => ws.id === workspaceId);

  if (!workspace) {
    throw new Error(`Workspace "${workspaceId}" não encontrado.`);
  }

  registry.activeId = workspaceId;
  await saveRegistry(registry);

  // Atualiza o path system
  setActiveWorkspace(workspace.slug, workspace.path || null);

  // Garante que os diretórios existem
  await ensureWorkspaceDirectories(workspace.slug, workspace.path);

  return workspace;
}

/**
 * Renomeia um workspace
 * @param {string} workspaceId - ID do workspace
 * @param {string} newName - Novo nome
 * @returns {Promise<Object>} O workspace atualizado
 */
export async function renameWorkspace(workspaceId, newName) {
  const registry = await readRegistry();
  const workspace = registry.workspaces.find(ws => ws.id === workspaceId);

  if (!workspace) {
    throw new Error(`Workspace "${workspaceId}" não encontrado.`);
  }

  workspace.name = newName.trim();
  workspace.updatedAt = new Date().toISOString();
  // Nota: o slug NÃO muda — renomear não move a pasta no disco
  // Isso evita problemas com paths de capas já salvas

  await saveRegistry(registry);
  return workspace;
}

/**
 * Remove um workspace
 * Não permite remover se é o único workspace
 * @param {string} workspaceId - ID do workspace
 * @returns {Promise<boolean>}
 */
export async function deleteWorkspace(workspaceId) {
  const registry = await readRegistry();

  if (registry.workspaces.length <= 1) {
    throw new Error('Não é possível remover o único workspace.');
  }

  const workspace = registry.workspaces.find(ws => ws.id === workspaceId);
  if (!workspace) {
    throw new Error(`Workspace "${workspaceId}" não encontrado.`);
  }

  // Remove a pasta do workspace do disco
  const wsDir = await getWorkspaceDir(workspace.slug, workspace.path);
  const dirExists = await exists(wsDir);
  if (dirExists) {
    await remove(wsDir, { recursive: true });
  }

  // Remove do registro
  registry.workspaces = registry.workspaces.filter(ws => ws.id !== workspaceId);

  // Se era o ativo, troca para o primeiro disponível
  if (registry.activeId === workspaceId) {
    const fallback = registry.workspaces[0];
    registry.activeId = fallback.id;
    setActiveWorkspace(fallback.slug, fallback.path || null);
  }

  await saveRegistry(registry);
  return true;
}

/**
 * Atualiza o path de um workspace no registro (usado pelo move)
 * @param {string} workspaceId - ID do workspace
 * @param {string|null} newPath - Novo path absoluto (null para voltar ao default)
 * @returns {Promise<Object>} O workspace atualizado
 */
export async function updateWorkspacePath(workspaceId, newPath) {
  const registry = await readRegistry();
  const workspace = registry.workspaces.find(ws => ws.id === workspaceId);

  if (!workspace) {
    throw new Error(`Workspace "${workspaceId}" não encontrado.`);
  }

  if (newPath) {
    workspace.path = newPath;
  } else {
    delete workspace.path;
  }

  workspace.updatedAt = new Date().toISOString();
  await saveRegistry(registry);

  // Se é o workspace ativo, atualiza o path system
  if (registry.activeId === workspaceId) {
    setActiveWorkspace(workspace.slug, workspace.path || null);
  }

  return workspace;
}

// ─── MIGRAÇÃO ──────────────────────────────────────────

/**
 * Migra o diretório do app de com.yokanri.app para Yokanri.
 *
 * Executada automaticamente no init(). Se o diretório antigo existir
 * e o novo não, renomeia (move atômico no mesmo filesystem).
 * Se ambos existirem ou só o novo existir, não faz nada.
 *
 * Seguro: nunca lança erro — o app continua mesmo se a migração falhar.
 */
async function migrateAppDirectory() {
  try {
    const oldDir = await getOldAppDir();
    const newDir = await getAppDir();

    // Se são o mesmo path, não precisa migrar (ex: identifier já é 'Yokanri')
    if (oldDir === newDir) return;

    const oldExists = await exists(oldDir);
    const newExists = await exists(newDir);

    if (oldExists && !newExists) {
      console.log(`[Migration] Migrando diretório: ${oldDir} → ${newDir}`);
      await rename(oldDir, newDir);
      console.log('[Migration] Diretório migrado com sucesso');
    } else if (oldExists && newExists) {
      // Ambos existem — cenário raro (migração parcial ou manual)
      // Não tenta fundir, apenas loga
      console.warn('[Migration] Ambos diretórios existem. Usando o novo:', newDir);
      console.warn('[Migration] Diretório antigo ainda presente:', oldDir);
    }
  } catch (error) {
    console.error('[Migration] Erro na migração de diretório:', error);
    // Não relança — o app deve funcionar mesmo se a migração falhar.
    // Na próxima execução, o init() criará os diretórios necessários.
  }
}

// ─── HELPERS INTERNOS ───────────────────────────────────

/**
 * Garante que os diretórios de um workspace existem
 * @param {string} slug
 * @param {string|null} [customPath] - Path customizado (se movido)
 */
async function ensureWorkspaceDirectories(slug, customPath = null) {
  const wsDir = await getWorkspaceDir(slug, customPath);
  const coversDir = await join(wsDir, DIRS.COVERS);
  await mkdir(coversDir, { recursive: true });
}

// ─── EXPORT DEFAULT ─────────────────────────────────────

const workspaceManager = {
  init,
  initDirsOnly,
  createWorkspace,
  listWorkspaces,
  getActiveWorkspace,
  switchWorkspace,
  renameWorkspace,
  deleteWorkspace,
  updateWorkspacePath,
};

export default workspaceManager;
