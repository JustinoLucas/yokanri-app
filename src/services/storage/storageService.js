/**
 * StorageService — Fachada pública de acesso a dados
 *
 * REGRA DE OURO: o restante do app importa SOMENTE este arquivo.
 * Nenhum componente ou hook deve importar jsonStorage ou workspaceManager diretamente.
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

import * as json from './jsonStorage';
import workspaceManager from '../workspace/workspaceManager';

// ─── INICIALIZAÇÃO ──────────────────────────────────────

/**
 * Inicializa o storage e o sistema de workspaces
 * Deve ser chamado UMA VEZ na inicialização do app
 * @returns {Promise<Object>} O workspace ativo
 */
export async function init() {
  return await workspaceManager.init();
}

// ─── OBRAS ──────────────────────────────────────────────

/** Carrega todas as obras do workspace ativo */
export async function loadObras() {
  return await json.loadObras();
}

/** Salva todas as obras no workspace ativo */
export async function saveObras(obras) {
  await json.saveObras(obras);
}

// ─── CONFIG ─────────────────────────────────────────────

/** Carrega as configurações do workspace ativo */
export async function loadConfig() {
  return await json.loadConfig();
}

/** Salva as configurações do workspace ativo */
export async function saveConfig(config) {
  await json.saveConfig(config);
}

// ─── CAPAS ──────────────────────────────────────────────

/** Salva uma imagem de capa no workspace ativo */
export async function saveCover(fileData, fileName) {
  return await json.saveCover(fileData, fileName);
}

/** Carrega uma capa do workspace ativo e retorna como Object URL */
export async function loadCover(fileName) {
  return await json.loadCover(fileName);
}

/** Remove uma capa do workspace ativo */
export async function deleteCover(fileName) {
  await json.deleteCover(fileName);
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
 * Troca o workspace ativo
 * @param {string} workspaceId - ID do workspace
 * @returns {Promise<Object>} O workspace ativado
 */
export async function switchWorkspace(workspaceId) {
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
  return await workspaceManager.deleteWorkspace(workspaceId);
}

// ─── EXPORT DEFAULT ─────────────────────────────────────

const storage = {
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
};

export default storage;
