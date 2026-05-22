/**
 * StorageService — Fachada pública de acesso a dados
 *
 * REGRA DE OURO: o restante do app importa SOMENTE este arquivo.
 * Nenhum componente ou hook deve importar sqliteStorage ou workspaceManager diretamente.
 *
 * Fluxo de inicialização:
 *   1. storage.init() → workspaceManager.init() → define workspace ativo
 *   2. Todos os métodos de dados operam no workspace ativo automaticamente
 *   3. Para trocar workspace: storage.switchWorkspace(id)
 *
 * Uso:
 *   import storage from './services/storage/storageService';
 *   await storage.init();
 *   const obras = await storage.loadObras();      // do workspace ativo
 *   const wsList = await storage.listWorkspaces(); // todos os workspaces
 */

import * as db from './sqliteStorage';
import { closeDb } from './sqliteConnection';
import { clearCoverCache } from './coverCache';
import workspaceManager from '../workspace/workspaceManager';
import { exportWorkspace, importWorkspaceSelect, importWorkspaceConfirm, replaceWorkspace, getExportPreviewData, executeExport } from '../workspace/workspaceExport';
import { analyzeMerge, executeMerge } from '../workspace/workspaceMerge';
import { moveWorkspace, getMovePreviewData, executeMoveToDestination } from '../workspace/workspaceMove';
import { openPath } from '@tauri-apps/plugin-opener';
import { getActiveWorkspaceDir } from '../workspace/workspacePaths';

// ─── INICIALIZAÇÃO ──────────────────────────────────────

/**
 * Prepara apenas os diretórios raiz do app (sem criar workspace).
 * Chamado pelo onboarding antes de criar o primeiro workspace.
 * @returns {Promise<void>}
 */
export async function initDirsOnly() {
  return await workspaceManager.initDirsOnly();
}

/**
 * Inicializa o storage e o sistema de workspaces.
 * Deve ser chamado UMA VEZ na inicialização do app,
 * APÓS o onboarding ter criado o primeiro workspace.
 * @returns {Promise<Object>} O workspace ativo
 */
export async function init() {
  return await workspaceManager.init();
}

// ─── OBRAS ──────────────────────────────────────────────

/** Carrega todas as obras do workspace ativo */
export async function loadObras() {
  return await db.loadObras();
}

/** Salva todas as obras no workspace ativo */
export async function saveObras(obras) {
  await db.saveObras(obras);
}

// ─── CONFIG ─────────────────────────────────────────────

/** Carrega as configurações do workspace ativo */
export async function loadConfig() {
  return await db.loadConfig();
}

/** Salva as configurações do workspace ativo */
export async function saveConfig(config) {
  await db.saveConfig(config);
}

// ─── CAPAS ──────────────────────────────────────────────

/** Salva uma imagem de capa no workspace ativo */
export async function saveCover(fileData, fileName) {
  return await db.saveCover(fileData, fileName);
}

/** Carrega uma capa do workspace ativo e retorna como Object URL */
export async function loadCover(fileName) {
  return await db.loadCover(fileName);
}

/** Remove uma capa do workspace ativo */
export async function deleteCover(fileName) {
  await db.deleteCover(fileName);
}

// ─── WORKSPACES ─────────────────────────────────────────

/** Lista todos os workspaces */
export async function listWorkspaces() {
  return await workspaceManager.listWorkspaces();
}

/** Retorna o workspace ativo */
export async function getActiveWorkspace() {
  return await workspaceManager.getActiveWorkspace();
}

/**
 * Cria um novo workspace
 * @param {string} name - Nome do workspace
 * @returns {Promise<Object>} O workspace criado
 */
export async function createWorkspace(name) {
  return await workspaceManager.createWorkspace(name);
}

/**
 * Troca o workspace ativo.
 * Fecha a conexão SQLite anterior e limpa o cache de capas antes de trocar.
 * @param {string} workspaceId - ID do workspace
 * @returns {Promise<Object>} O workspace ativado
 */
export async function switchWorkspace(workspaceId) {
  await closeDb();
  clearCoverCache(); // Revoga Object URLs do workspace anterior
  return await workspaceManager.switchWorkspace(workspaceId);
}

/**
 * Renomeia um workspace
 * @param {string} workspaceId - ID do workspace
 * @param {string} newName - Novo nome
 * @returns {Promise<Object>} O workspace atualizado
 */
export async function renameWorkspace(workspaceId, newName) {
  return await workspaceManager.renameWorkspace(workspaceId, newName);
}

/**
 * Remove um workspace (não permite remover o único)
 * @param {string} workspaceId - ID do workspace
 * @returns {Promise<boolean>}
 */
export async function deleteWorkspace(workspaceId) {
  await closeDb();
  clearCoverCache(); // Limpa URLs do workspace deletado
  return await workspaceManager.deleteWorkspace(workspaceId);
}

// ─── EXPORT/IMPORT WORKSPACE ───────────────────────────

/**
 * Exporta o workspace ativo para um arquivo .yokanri
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{success, message, path?}>}
 */
export async function exportCurrentWorkspace(workspace) {
  return await exportWorkspace(workspace);
}

/**
 * Abre o diálogo "Salvar como" e coleta metadados SEM exportar.
 * Retorna preview para confirmação antes da exportação.
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{cancelled, savePath?, obraCount?, coverCount?, estimatedSizeBytes?, fileExists?}>}
 */
export async function getExportPreview(workspace) {
  return await getExportPreviewData(workspace);
}

/**
 * Executa a exportação real dado um savePath já confirmado pelo usuário.
 * @param {Object} workspace - Objeto do workspace ativo
 * @param {string} savePath - Caminho de destino
 * @returns {Promise<{success, message, obraCount?, coverCount?, path?}>}
 */
export async function executeWorkspaceExport(workspace, savePath) {
  return await executeExport(workspace, savePath);
}

/**
 * Abre o diálogo para selecionar um arquivo .yokanri e valida
 * Retorna preview para confirmação do usuário
 * @returns {Promise<{success, message, preview?, _zipData?}>}
 */
export async function importWorkspaceFile() {
  return await importWorkspaceSelect();
}

/**
 * Cria novo workspace com dados importados
 * @param {Object} zipData - Dados descompactados
 * @param {Object} manifest - Manifest do arquivo
 * @returns {Promise<{success, message, workspace?}>}
 */
export async function confirmImportWorkspace(zipData, manifest) {
  return await importWorkspaceConfirm(
    zipData,
    manifest,
    workspaceManager.createWorkspace
  );
}

/**
 * Analisa dados importados para merge (preview de duplicatas)
 * @param {Object} zipData - Dados descompactados
 * @returns {Promise<{success, stats?}>}
 */
export async function analyzeImportMerge(zipData) {
  return await analyzeMerge(zipData);
}

/**
 * Executa merge: insere obras novas no workspace ativo
 * @param {Object} zipData - Dados descompactados
 * @returns {Promise<{success, message, inserted?, coversAdded?}>}
 */
export async function executeImportMerge(zipData) {
  return await executeMerge(zipData);
}

/**
 * Substitui completamente o workspace ativo com dados importados
 * @param {Object} zipData - Dados descompactados
 * @returns {Promise<{success, message}>}
 */
export async function replaceCurrentWorkspace(zipData) {
  return await replaceWorkspace(zipData);
}

/**
 * Move o workspace ativo para outro diretório
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{success, message, workspace?}>}
 */
export async function moveCurrentWorkspace(workspace) {
  return await moveWorkspace(workspace);
}

/**
 * Abre o diálogo de pasta e coleta metadados do move SEM mover.
 * Retorna preview para confirmação antes da operação.
 * @param {Object} workspace - Objeto do workspace ativo
 * @returns {Promise<{cancelled, workspaceName?, sourcePath?, destPath?, fileCount?, totalSizeBytes?, destExists?}>}
 */
export async function getMovePreview(workspace) {
  return await getMovePreviewData(workspace);
}

/**
 * Executa o move real dado um destPath já confirmado pelo usuário.
 * @param {Object} workspace - Objeto do workspace ativo
 * @param {string} destDir - Caminho de destino final
 * @returns {Promise<{success, message, workspace?}>}
 */
export async function executeMoveWorkspace(workspace, destDir) {
  return await executeMoveToDestination(workspace, destDir);
}

/**
 * Abre a pasta do workspace ativo no explorador de arquivos
 */
export async function openWorkspaceFolder() {
  const wsDir = await getActiveWorkspaceDir();
  await openPath(wsDir);
}

// ─── EXPORT DEFAULT ─────────────────────────────────────

const storage = {
  initDirsOnly,
  init,
  // Dados
  loadObras,
  saveObras,
  loadConfig,
  saveConfig,
  saveCover,
  loadCover,
  deleteCover,
  // Workspaces
  listWorkspaces,
  getActiveWorkspace,
  createWorkspace,
  switchWorkspace,
  renameWorkspace,
  deleteWorkspace,
  // Export/Import
  exportCurrentWorkspace,
  importWorkspaceFile,
  confirmImportWorkspace,
  analyzeImportMerge,
  executeImportMerge,
  replaceCurrentWorkspace,
  moveCurrentWorkspace,
  openWorkspaceFolder,
  // Split API (preview → confirm → execute)
  getExportPreview,
  executeWorkspaceExport,
  getMovePreview,
  executeMoveWorkspace,
};

export default storage;
