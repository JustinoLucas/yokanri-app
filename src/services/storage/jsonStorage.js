/**
 * Implementação de storage usando JSON + Tauri filesystem
 *
 * Todos os caminhos agora são resolvidos via workspacePaths,
 * que aponta para o workspace ativo automaticamente.
 *
 * Futuramente pode ser substituído por sqliteStorage.js sem
 * alterar nenhum outro arquivo do app.
 */

import {
  readFile,
  writeFile,
  exists,
  remove,
} from '@tauri-apps/plugin-fs';
import { getFilePath, getCoversDir, getCoverPath, FILES } from '../workspace/workspacePaths';

// ─── OBRAS ──────────────────────────────────────────────

/**
 * Carrega todas as obras do workspace ativo
 * @returns {Promise<Array>} Array de obras ou [] se o arquivo não existir
 */
export async function loadObras() {
  const filePath = await getFilePath(FILES.LIBRARY);
  const fileExists = await exists(filePath);

  if (!fileExists) {
    return [];
  }

  const content = await readFile(filePath);
  const text = new TextDecoder().decode(content);
  return JSON.parse(text);
}

/**
 * Salva todas as obras no workspace ativo
 * @param {Array} obras - Array completo de obras
 */
export async function saveObras(obras) {
  const filePath = await getFilePath(FILES.LIBRARY);
  const content = new TextEncoder().encode(JSON.stringify(obras, null, 2));
  await writeFile(filePath, content);
}

// ─── CONFIG ─────────────────────────────────────────────

/**
 * Carrega as configurações do workspace ativo
 * @returns {Promise<Object|null>} Configurações ou null se não existir
 */
export async function loadConfig() {
  const filePath = await getFilePath(FILES.SETTINGS);
  const fileExists = await exists(filePath);

  if (!fileExists) {
    return null;
  }

  const content = await readFile(filePath);
  const text = new TextDecoder().decode(content);
  return JSON.parse(text);
}

/**
 * Salva as configurações do workspace ativo
 * @param {Object} config - Objeto de configuração
 */
export async function saveConfig(config) {
  const filePath = await getFilePath(FILES.SETTINGS);
  const content = new TextEncoder().encode(JSON.stringify(config, null, 2));
  await writeFile(filePath, content);
}

// ─── CAPAS ──────────────────────────────────────────────

/**
 * Salva uma imagem de capa no workspace ativo
 * @param {File|Blob|Uint8Array} fileData - Dados do arquivo
 * @param {string} fileName - Nome do arquivo destino
 * @returns {Promise<string>} Nome do arquivo salvo
 */
export async function saveCover(fileData, fileName) {
  const filePath = await getCoverPath(fileName);

  let bytes;
  if (fileData instanceof Uint8Array) {
    bytes = fileData;
  } else {
    // File ou Blob: converter para Uint8Array
    const buffer = await fileData.arrayBuffer();
    bytes = new Uint8Array(buffer);
  }

  await writeFile(filePath, bytes);
  return fileName;
}

/**
 * Carrega uma imagem de capa e retorna como Object URL
 * @param {string} fileName - Nome do arquivo da capa
 * @returns {Promise<string|null>} URL da imagem ou null se não encontrada
 */
export async function loadCover(fileName) {
  try {
    const filePath = await getCoverPath(fileName);
    const fileExists = await exists(filePath);

    if (!fileExists) {
      return null;
    }

    const content = await readFile(filePath);

    // Detecta o tipo MIME pela extensão
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      avif: 'image/avif',
    };
    const mimeType = mimeTypes[ext] || 'image/png';

    const blob = new Blob([content], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Erro ao carregar capa "${fileName}":`, error);
    return null;
  }
}

/**
 * Remove uma imagem de capa do workspace ativo
 * @param {string} fileName - Nome do arquivo a remover
 */
export async function deleteCover(fileName) {
  try {
    const filePath = await getCoverPath(fileName);
    const fileExists = await exists(filePath);

    if (fileExists) {
      await remove(filePath);
    }
  } catch (error) {
    console.error(`Erro ao deletar capa "${fileName}":`, error);
  }
}
