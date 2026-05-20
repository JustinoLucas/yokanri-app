/**
 * Resolve caminhos dentro do workspace ativo
 *
 * Este módulo é o equivalente do antigo paths.js, mas agora
 * todos os caminhos são relativos ao workspace ativo.
 *
 * Estrutura de um workspace:
 *   workspaces/<slug>/
 *   ├── library.json     ← dados das obras
 *   ├── settings.json    ← configurações
 *   └── covers/          ← imagens de capa
 */

import { appDataDir, join } from '@tauri-apps/api/path';

// Cache
let cachedAppDir = null;
let currentWorkspaceSlug = null;

// Nomes dos arquivos dentro de cada workspace
export const FILES = {
  LIBRARY: 'library.json',
  SETTINGS: 'settings.json',
};

/**
 * Retorna o diretório base do app: AppData/Roaming/Yokanri/
 */
export async function getAppDir() {
  if (!cachedAppDir) {
    cachedAppDir = await appDataDir();
  }
  return cachedAppDir;
}

/**
 * Define qual workspace está ativo
 * Chamado pelo workspaceManager durante init e ao trocar workspace
 * @param {string} slug - Slug do workspace (ex: 'default', 'romance')
 */
export function setActiveWorkspace(slug) {
  currentWorkspaceSlug = slug;
}

/**
 * Retorna o slug do workspace ativo
 */
export function getActiveSlug() {
  return currentWorkspaceSlug;
}

/**
 * Retorna o diretório raiz de todos os workspaces
 * AppData/Roaming/Yokanri/workspaces/
 */
export async function getWorkspacesRoot() {
  const appDir = await getAppDir();
  return await join(appDir, 'workspaces');
}

/**
 * Retorna o diretório de um workspace específico
 * @param {string} slug - Slug do workspace
 */
export async function getWorkspaceDir(slug) {
  const root = await getWorkspacesRoot();
  return await join(root, slug);
}

/**
 * Retorna o diretório do workspace ATIVO
 */
export async function getActiveWorkspaceDir() {
  if (!currentWorkspaceSlug) {
    throw new Error('Nenhum workspace ativo. Chame workspaceManager.init() primeiro.');
  }
  return await getWorkspaceDir(currentWorkspaceSlug);
}

/**
 * Retorna o caminho de um arquivo dentro do workspace ativo
 * @param {string} fileName - Nome do arquivo (ex: 'library.json')
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
  return await join(wsDir, 'covers');
}

/**
 * Retorna o caminho de uma capa específica no workspace ativo
 * @param {string} fileName - Nome do arquivo da capa
 */
export async function getCoverPath(fileName) {
  const coversDir = await getCoversDir();
  return await join(coversDir, fileName);
}
