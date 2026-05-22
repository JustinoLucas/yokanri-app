/**
 * WorkspacePaths — Resolução centralizada de caminhos do Yokanri
 *
 * Este módulo é a ÚNICA fonte de verdade para nomes de pastas,
 * arquivos e resolução de paths. Nenhum outro módulo deve usar
 * strings hardcoded para nomes de diretórios ou arquivos.
 *
 * Estrutura no disco:
 *
 *   -- AppData -------------------------------------------
 *   C:\Users\{user}\AppData\Roaming\Yokanri\
 *   |-- workspaces.json              <- registro central
 *   +-- workspaces\
 *       +-- default\
 *           |-- data.db
 *           +-- covers\
 *
 *   -- Custom Location -----------------------------------
 *   D:\Backups\Yokanri\
 *   +-- Minha Biblioteca\
 *       |-- data.db
 *       +-- covers\
 *
 * Plataformas:
 *   Windows:  AppData\Roaming\Yokanri\
 *   Linux:    ~/.local/share/Yokanri/
 *   macOS:    ~/Library/Application Support/Yokanri/
 */

import { appDataDir, dataDir, join } from '@tauri-apps/api/path';

// ─── CONSTANTES CENTRALIZADAS ───────────────────────────
// Todos os nomes de pastas e arquivos em um único lugar.
// Qualquer módulo que precise de um path deve importar daqui.

/** Nome da pasta raiz do app (usada em AppData e em custom locations) */
export const APP_FOLDER_NAME = 'Yokanri';

/** Nomes de diretórios */
export const DIRS = {
  WORKSPACES: 'workspaces',
  COVERS: 'covers',
};

/** Nomes de arquivos */
export const FILES = {
  REGISTRY: 'workspaces.json',
  DATABASE: 'data.db',
  // Legado (migração JSON -> SQLite)
  LIBRARY: 'library.json',
  SETTINGS: 'settings.json',
};

// ─── CACHE ──────────────────────────────────────────────

let cachedAppDir = null;
let cachedOldAppDir = null;
let currentWorkspaceSlug = null;
let currentWorkspaceCustomPath = null;

// ─── APP DIRECTORY ──────────────────────────────────────

/**
 * Retorna o diretorio base do app.
 *
 * Usa dataDir() (Roaming/ no Windows) + "Yokanri" para gerar
 * um path limpo em vez do identifier reverso (com.yokanri.app).
 *
 * Windows:  C:\Users\{user}\AppData\Roaming\Yokanri\
 * Linux:    ~/.local/share/Yokanri/
 * macOS:    ~/Library/Application Support/Yokanri/
 */
export async function getAppDir() {
  if (!cachedAppDir) {
    const baseDir = await dataDir();
    cachedAppDir = await join(baseDir, APP_FOLDER_NAME);
  }
  return cachedAppDir;
}

/**
 * Retorna o diretorio ANTIGO do app (usado apenas para migracao).
 * Corresponde ao appDataDir() do Tauri: AppData/Roaming/com.yokanri.app/
 *
 * Chamado pelo workspaceManager durante init() para detectar e migrar
 * dados da versao anterior.
 */
export async function getOldAppDir() {
  if (!cachedOldAppDir) {
    cachedOldAppDir = await appDataDir();
  }
  return cachedOldAppDir;
}

// ─── WORKSPACE STATE ────────────────────────────────────

/**
 * Define qual workspace esta ativo
 * Chamado pelo workspaceManager durante init e ao trocar workspace
 * @param {string} slug - Slug do workspace (ex: 'default', 'romance')
 * @param {string|null} [customPath] - Path absoluto se o workspace foi movido
 */
export function setActiveWorkspace(slug, customPath = null) {
  currentWorkspaceSlug = slug;
  currentWorkspaceCustomPath = customPath || null;
}

/**
 * Retorna o slug do workspace ativo
 */
export function getActiveSlug() {
  return currentWorkspaceSlug;
}

// ─── WORKSPACE DIRECTORIES ─────────────────────────────

/**
 * Retorna o diretorio raiz de todos os workspaces locais
 * AppData/Roaming/Yokanri/workspaces/
 */
export async function getWorkspacesRoot() {
  const appDir = await getAppDir();
  return await join(appDir, DIRS.WORKSPACES);
}

/**
 * Retorna o diretorio de um workspace especifico
 * @param {string} slug - Slug do workspace
 * @param {string|null} [customPath] - Path customizado (se o workspace foi movido)
 */
export async function getWorkspaceDir(slug, customPath = null) {
  if (customPath) {
    return customPath;
  }
  const root = await getWorkspacesRoot();
  return await join(root, slug);
}

/**
 * Retorna o diretorio do workspace ATIVO
 * Respeita path customizado se o workspace foi movido
 */
export async function getActiveWorkspaceDir() {
  if (!currentWorkspaceSlug) {
    throw new Error('Nenhum workspace ativo. Chame workspaceManager.init() primeiro.');
  }
  if (currentWorkspaceCustomPath) {
    return currentWorkspaceCustomPath;
  }
  return await getWorkspaceDir(currentWorkspaceSlug);
}

// ─── FILE PATHS ─────────────────────────────────────────

/**
 * Retorna o caminho de um arquivo dentro do workspace ativo
 * @param {string} fileName - Nome do arquivo (ex: FILES.DATABASE)
 */
export async function getFilePath(fileName) {
  const wsDir = await getActiveWorkspaceDir();
  return await join(wsDir, fileName);
}

/**
 * Retorna o caminho da pasta de capas do workspace ativo
 */
export async function getCoversDir() {
  const wsDir = await getActiveWorkspaceDir();
  return await join(wsDir, DIRS.COVERS);
}

/**
 * Retorna o caminho de uma capa especifica no workspace ativo
 * @param {string} fileName - Nome do arquivo da capa
 */
export async function getCoverPath(fileName) {
  const coversDir = await getCoversDir();
  return await join(coversDir, fileName);
}
